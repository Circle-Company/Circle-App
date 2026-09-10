import React from "react"
import type { Event, StreamChat } from "stream-chat"

import { apiRoutes } from "@/api"
import { ChatUnavailableError } from "@/api/chat/chat"
import { connectChatUser, disconnectChatUser } from "@/features/chat"

/**
 * A conexão do chat: quem conecta, quando, e o que a UI vê enquanto isso.
 *
 * Separado de `index.tsx` pelo mesmo motivo que `state.ts`: renderizar árvore não funciona
 * sob o vitest (CLAUDE.md > Testing), então o que precisa de teste — a classificação do erro
 * e o provedor de token — mora fora do componente, em função pura.
 *
 * O que este arquivo **não** faz: buscar conversas, mensagens ou presença. Isso é o SDK, lido
 * direto pelos hooks de tela. Aqui só se resolve a credencial e o socket.
 */

export type ChatConnectionStatus =
    /** Ninguém logado, ou ainda não tentamos. */
    | "idle"
    /** `connectUser` em voo. */
    | "connecting"
    /** WebSocket de pé. */
    | "ready"
    /** Chat desligado neste ambiente (503). A aba não deve existir. */
    | "unavailable"
    /** Rede, provedor fora, credencial recusada. Cabe um botão de tentar de novo. */
    | "error"

/**
 * Traduz a falha da conexão em estado de UI.
 *
 * A distinção é a razão de existir da função: `unavailable` é uma configuração do ambiente e
 * some a aba inteira; `error` é transitório e ganha um "tentar de novo". Tratar os dois como
 * o mesmo estado ofereceria retry para algo que nunca vai funcionar nesta sessão.
 */
export function statusForConnectionError(error: unknown): ChatConnectionStatus {
    return error instanceof ChatUnavailableError ? "unavailable" : "error"
}

/**
 * O chat já se declarou indisponível nesta sessão.
 *
 * Módulo, e não estado do componente, porque o valor precisa sobreviver a remontagem: o
 * strict mode do React 19 monta o provider duas vezes em desenvolvimento, e sem isto o 503
 * seria pedido de novo a cada montagem. O §4.2 do guia é explícito: 503 **não** se retenta.
 */
let unavailableForSession = false

/** Rearma a checagem. Chamado no encerramento da sessão — outro login, outro ambiente. */
export function resetChatAvailability(): void {
    unavailableForSession = false
}

/**
 * Conecta o usuário logado ao Stream.
 *
 * O primeiro token vem da mesma chamada que traz a `apiKey` — não há como conectar sem ela,
 * então pedir os dois de uma vez evita um round-trip. As renovações seguintes chamam
 * `/chat/token` de novo, e é o SDK quem decide quando: o token vale uma hora, e sem este
 * provedor a sessão do chat morre silenciosamente ao expirar.
 *
 * O `expectedUserId` é a guarda de identidade (§2.6): se o backend emitir credencial para
 * outra pessoa — sessão trocada no meio do caminho —, conectar entregaria as conversas de
 * outra conta a esta tela.
 */
export async function connectChatSession(expectedUserId: string): Promise<StreamChat> {
    if (unavailableForSession) throw new ChatUnavailableError()

    const first = await apiRoutes.chat.issueToken().catch((error: unknown) => {
        // Marcado aqui, e não no `useChatConnection`: quem descobre o 503 é esta chamada, e
        // qualquer outro chamador da função precisa herdar a decisão.
        if (error instanceof ChatUnavailableError) unavailableForSession = true
        throw error
    })

    if (String(first.userId) !== String(expectedUserId)) {
        throw new Error("CHAT_TOKEN_IDENTITY_MISMATCH")
    }

    // A primeira renovação reaproveita o token que já temos em mãos; da segunda em diante,
    // busca. Sem isto o SDK pediria um token novo imediatamente, desperdiçando a emissão que
    // acabou de acontecer.
    let pendingFirstToken: string | null = first.token

    return connectChatUser({
        apiKey: first.apiKey,
        userId: String(first.userId),
        token: async () => {
            if (pendingFirstToken) {
                const token = pendingFirstToken
                pendingFirstToken = null
                return token
            }
            return (await apiRoutes.chat.issueToken()).token
        },
    })
}

/** Encerra a sessão do chat e rearma a checagem de disponibilidade. */
export async function endChatSession(): Promise<void> {
    resetChatAvailability()
    await disconnectChatUser()
}

export type ChatConnection = {
    status: ChatConnectionStatus
    client: StreamChat | null
    /** WebSocket de pé **agora**. Diferente de `status === "ready"`: a conexão cai e volta. */
    online: boolean
    /** Nova tentativa manual. Sem efeito em `unavailable` — ali não há o que tentar. */
    retry: () => void
}

/**
 * Mantém a conexão viva enquanto houver alguém logado.
 *
 * `userId` vazio significa "ninguém logado": desconecta e volta a `idle`. É o mesmo caminho
 * do logout, e é de propósito — a tela não precisa saber por que a sessão acabou.
 */
export function useChatConnection(userId: string | null | undefined): ChatConnection {
    const [client, setClient] = React.useState<StreamChat | null>(null)
    const [status, setStatus] = React.useState<ChatConnectionStatus>("idle")
    const [online, setOnline] = React.useState(false)
    const [attempt, setAttempt] = React.useState(0)

    const currentUserId = userId ? String(userId) : ""

    React.useEffect(() => {
        if (!currentUserId) {
            setClient(null)
            setOnline(false)
            setStatus("idle")
            // Sem `await`: o efeito de limpeza não pode ser assíncrono, e a desconexão é
            // best-effort de qualquer forma — o mesmo critério do `signOut` do app.
            endChatSession().catch(() => {})
            return
        }

        // `cancelled` em vez de abortar a conexão: o `connectUser` já está em voo e derrubá-lo
        // deixaria o client num estado intermediário. Aqui só se descarta o resultado tardio,
        // que é o que causaria o setState em componente desmontado.
        let cancelled = false
        setStatus("connecting")

        connectChatSession(currentUserId)
            .then((connected) => {
                if (cancelled) return
                setClient(connected)
                setOnline(true)
                setStatus("ready")
            })
            .catch((error) => {
                if (cancelled) return
                setClient(null)
                setOnline(false)
                setStatus(statusForConnectionError(error))
                if (__DEV__) console.warn("[chat] falha ao conectar:", error)
            })

        return () => {
            cancelled = true
        }
    }, [currentUserId, attempt])

    /*
     * Background e foreground **não** passam por aqui.
     *
     * O SDK fecha o socket ao ir para o background e o reabre sozinho na volta, emitindo
     * `connection.changed` e depois `connection.recovered`. Desconectar no `AppState` — a
     * tentação óbvia — zeraria o estado em memória e faria a volta do background recarregar
     * a lista inteira.
     */
    React.useEffect(() => {
        if (!client) return
        const subscription = client.on("connection.changed", (event: Event) => {
            setOnline(Boolean(event.online))
        })
        return () => subscription.unsubscribe()
    }, [client])

    const retry = React.useCallback(() => {
        setAttempt((n) => n + 1)
    }, [])

    return { status, client, online, retry }
}
