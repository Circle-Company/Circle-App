import { AxiosError } from "axios"

import api from "@/api"

import { ChatTokenResponse, OpenDirectChannelResponse, SyncChatUsersResponse } from "./chat.types"

/**
 * O chat está desligado neste ambiente (503 `NOT_CONFIGURED`).
 *
 * Não é falha: é o backend sem as chaves do Stream. A UI esconde a aba e **não tenta de
 * novo nesta sessão** — retentar só produziria 503 de novo, um por tentativa.
 */
export class ChatUnavailableError extends Error {
    constructor() {
        super("CHAT_UNAVAILABLE")
        this.name = "ChatUnavailableError"
    }
}

/** 403 na abertura: a amizade não existe mais. Abrir a conversa é impossível, não adiado. */
export class NotFriendsError extends Error {
    constructor() {
        super("NOT_FRIENDS")
        this.name = "NotFriendsError"
    }
}

/** Quantas vezes uma falha do provedor (502) é retentada antes de desistir. */
const PROVIDER_RETRIES = 2
/** Base do backoff exponencial: 300ms, 600ms. Curto de propósito — há uma tela esperando. */
const PROVIDER_BACKOFF_MS = 300

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Lê `status` e `code` da resposta de erro.
 *
 * O `code` é o que manda quando existe — a mensagem é texto para humano e muda sem aviso.
 * O `status` é o fallback para quando o backend responde sem corpo (gateway, timeout).
 */
function readFailure(error: unknown): { status?: number; code?: string } {
    const response = (error as AxiosError<{ code?: string }>)?.response
    return { status: response?.status, code: response?.data?.code }
}

/**
 * Traduz o erro HTTP para o erro com significado no app.
 *
 * Sempre lança — o tipo de retorno `never` é o que permite usar isto como `.catch(mapChatError)`
 * sem que o chamador precise tratar um caminho de sucesso fantasma.
 */
function mapChatError(error: unknown): never {
    const { status, code } = readFailure(error)

    if (code === "NOT_CONFIGURED" || status === 503) throw new ChatUnavailableError()
    if (code === "FORBIDDEN" || status === 403) throw new NotFriendsError()

    throw error
}

/** 502 é a única falha retentável: o provedor oscilou, o pedido continua válido. */
function isProviderError(error: unknown): boolean {
    const { status, code } = readFailure(error)
    return code === "PROVIDER_ERROR" || status === 502
}

/**
 * Executa `run`, retentando só o 502.
 *
 * 503 e 403 saem na primeira tentativa: os dois descrevem um estado do mundo — chat
 * desligado, amizade desfeita —, e nenhum número de tentativas muda esse estado.
 */
async function withProviderRetry<T>(run: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
        try {
            return await run()
        } catch (error) {
            if (attempt >= PROVIDER_RETRIES || !isProviderError(error)) mapChatError(error)
            await sleep(PROVIDER_BACKOFF_MS * 2 ** attempt)
        }
    }
}

/**
 * Emite a credencial de conexão do Stream.
 *
 * Chamada também **a cada renovação** de token (TTL de 1h), e é isso que mantém nome e foto
 * do usuário sincronizados no Stream sem uma rota só para isso: o backend re-sincroniza o
 * perfil a cada emissão.
 */
async function issueToken(): Promise<ChatTokenResponse> {
    return withProviderRetry(async () => {
        const response = await api.post("/chat/token")
        return response.data as ChatTokenResponse
    })
}

/**
 * Abre (ou recupera) a conversa direta com alguém.
 *
 * **Obrigatória antes do primeiro `watch()`** com uma pessoa: é ela que valida a amizade e
 * cria o canal. O app nunca cria canal pelo SDK — fazer isso pularia a validação e criaria
 * conversa entre quem não é amigo.
 */
async function openDirectChannel({
    targetUserId,
}: {
    targetUserId: string
}): Promise<OpenDirectChannelResponse> {
    return withProviderRetry(async () => {
        const response = await api.post("/chat/channels/direct", { targetUserId })
        return response.data as OpenDirectChannelResponse
    })
}

/**
 * Re-sincroniza nome e foto destes usuários no Stream.
 *
 * Best-effort e limitado a 50 ids por chamada — o corte acontece aqui, e não no chamador,
 * porque um id a mais devolve 400 e a tela que pediu o sync não tem por que saber disso.
 */
async function syncUsers({ userIds }: { userIds: string[] }): Promise<SyncChatUsersResponse> {
    return withProviderRetry(async () => {
        const response = await api.post("/chat/users/sync", { userIds: userIds.slice(0, 50) })
        return response.data as SyncChatUsersResponse
    })
}

export const routes = {
    issueToken,
    openDirectChannel,
    syncUsers,
}
