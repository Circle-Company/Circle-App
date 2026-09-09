import type { AxiosError } from "axios"

import api from "@/api"
import type {
    GetMomentResponse,
    MomentContentType,
    MomentDetail,
    MomentErrorKind,
    RawMoment,
    RawTopComment,
    TopComment,
} from "./moment.types"

/**
 * `GET /moments/:id` — leitura pura de um momento.
 *
 * **Não registra visualização.** Quem contabiliza é `POST /moments/:id/watch`
 * (`moment.actions.watch`), disparado pelo player quando o critério de view é atingido.
 *
 * O `:id` é um Snowflake e trafega como string de ponta a ponta — `Number()` estoura
 * `Number.MAX_SAFE_INTEGER` e corrompe o id silenciosamente.
 */

/**
 * Erro com a causa já classificada, para o chamador decidir entre "tentar de novo" e
 * "mostrar mensagem definitiva" sem reabrir o corpo da resposta.
 */
export class MomentRequestError extends Error {
    constructor(
        public readonly kind: MomentErrorKind,
        message: string,
    ) {
        super(message)
        this.name = "MomentRequestError"
    }

    /** Só o transitório permite retry. Ver §6 do contrato. */
    get isRetryable(): boolean {
        return this.kind === "unknown"
    }
}

/**
 * Classifica o erro **priorizando o status**, com o texto como último recurso.
 *
 * Hoje tudo fora do 401 chega como `400` e a distinção depende de comparar a string de
 * `error` — frágil por natureza, quebra se o backend mudar o texto (§7.4). Quando o
 * endpoint passar a devolver `404`/`403`, os dois primeiros ramos assumem sozinhos e o
 * string-matching some sem tocar em mais nada.
 */
export function toMomentError(status: number | undefined, error?: string): MomentRequestError {
    const message = error ?? ""

    if (status === 401) return new MomentRequestError("unauthenticated", message)
    if (status === 404) return new MomentRequestError("not-found", message)
    if (status === 403) return new MomentRequestError("forbidden", message)

    if (message.includes("not found")) return new MomentRequestError("not-found", message)
    if (message.includes("Access denied")) return new MomentRequestError("forbidden", message)

    return new MomentRequestError("unknown", message)
}

/** Ausência chega como `""`; a UI recebe `null`. */
const emptyToNull = (value: unknown): string | null =>
    typeof value === "string" && value.length > 0 ? value : null

const asNumber = (value: unknown): number =>
    typeof value === "number" && Number.isFinite(value) ? value : 0

/**
 * `contentType` é tratado como **aberto**: um terceiro valor não pode derrubar a tela.
 * O fallback é `image`, que renderiza com o caminho mais simples (sem player).
 */
function normalizeContentType(value: unknown): MomentContentType {
    return value === "video" ? "video" : "image"
}

function normalizeSentiment(value: unknown): TopComment["sentiment"] {
    return value === "positive" || value === "negative" ? value : "neutral"
}

function normalizeTopComment(raw: RawTopComment): TopComment {
    return {
        id: String(raw.id),
        content: raw.content ?? "",
        // Sem menções no texto os dois coincidem; por isso `content` é o fallback.
        richContent: raw.richContent || raw.content || "",
        user: {
            id: String(raw.user?.id ?? ""),
            username: emptyToNull(raw.user?.username),
            profilePicture: emptyToNull(raw.user?.profilePicture),
        },
        sentiment: normalizeSentiment(raw.sentiment),
        createdAt: new Date(raw.createdAt),
    }
}

export function normalizeMoment(raw: RawMoment): MomentDetail {
    return {
        id: String(raw.id),
        contentType: normalizeContentType(raw.contentType),
        media: emptyToNull(raw.media),
        thumbnail: emptyToNull(raw.thumbnail),
        // Em imagem o backend sempre manda `0` e `false`; não há caso especial aqui.
        duration: asNumber(raw.duration),
        size: asNumber(raw.size),
        hasAudio: Boolean(raw.hasAudio),
        ageRestriction: Boolean(raw.ageRestriction),
        contentWarning: Boolean(raw.contentWarning),
        metrics: {
            views: asNumber(raw.metrics?.totalViews),
            likes: asNumber(raw.metrics?.totalLikes),
            comments: asNumber(raw.metrics?.totalComments),
        },
        publishedAt: new Date(raw.publishedAt),
        // A chave é **omitida** quando não há destaque — `=== null` nunca dispara.
        topComment: raw.topComment ? normalizeTopComment(raw.topComment) : null,
    }
}

export async function get(momentId: string, signal?: AbortSignal): Promise<MomentDetail> {
    if (!momentId) throw new MomentRequestError("not-found", "Moment ID is required")

    try {
        const res = await api.get<GetMomentResponse>(`/moments/${momentId}`, { signal })
        const body = res?.data

        // Um `200` com `success: false` não existe no contrato, mas custa uma linha cobrir.
        if (!body?.success || !body.moment) {
            throw toMomentError(res?.status, body?.error)
        }

        return normalizeMoment(body.moment)
    } catch (error) {
        if (error instanceof MomentRequestError) throw error

        const axiosError = error as AxiosError<GetMomentResponse>
        // Sem `response` é rede/timeout: transitório, e o retry faz sentido.
        if (!axiosError?.response) {
            throw new MomentRequestError("unknown", axiosError?.message ?? "Network error")
        }

        throw toMomentError(axiosError.response.status, axiosError.response.data?.error)
    }
}
