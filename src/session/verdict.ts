/**
 * Classificação da falha de um refresh. Ver `docs/session-management.md` §5.6.
 *
 * A regra que o código antigo errava: "sessão morta" e "erro transitório" não cobrem o
 * espaço todo. Falta o **desconhecido** — e tratá-lo como terminal desloga usuário com
 * sessão válida. São quatro categorias, e só uma delas desloga.
 */

export type RefreshVerdict =
    /** O servidor negou explicitamente. Não adianta tentar de novo. */
    | { kind: "terminal"; reason: TerminalReason; status?: number }
    /** Falha passageira. Preserva os tokens e tenta de novo com backoff. */
    | { kind: "transient"; reason: string; status?: number; retryAfterMs?: number }
    /**
     * Não sabemos se o servidor processou a rotação. Nunca é terminal — mas também não
     * pode disparar outro refresh às cegas, porque o token que temos pode já estar
     * consumido, e reapresentá-lo revoga TODAS as sessões do usuário (§13.1).
     */
    | { kind: "unknown"; reason: string }

export type TerminalReason =
    | "REFRESH_TOKEN_INVALID" // 401 — desconhecido, já usado, ou revogado por login em outro device
    | "ACCOUNT_BLOCKED" // 403 — conta bloqueada ou excluída
    | "BAD_REQUEST" // 400 — header ausente; bug do cliente
    | "NO_REFRESH_TOKEN" // não há o que enviar
    | "MALFORMED_RESPONSE" // 200 sem token no corpo

/** Erro lançado pelo teto de tempo local — a origem da categoria "desconhecido". */
export class RefreshTimeoutError extends Error {
    constructor(ms: number) {
        super(`Refresh excedeu ${ms}ms`)
        this.name = "RefreshTimeoutError"
    }
}

/** Teto de tempo do refresh. Generoso de propósito: abortar cedo cria o caso "desconhecido",
 * que é o mais caro de todos. Serve só para não pendurar a fila para sempre. */
export const REFRESH_TIMEOUT_MS = 30_000

const BACKOFF_STEPS_MS = [1_000, 2_000, 4_000, 8_000]
const BACKOFF_CAP_MS = 30_000

/**
 * Espera antes da próxima tentativa de um refresh transitório. O jitter evita que todos os
 * devices que perderam a rede voltem no mesmo instante quando ela retorna.
 */
export function backoffDelayMs(attempt: number, random: () => number = Math.random): number {
    const base = BACKOFF_STEPS_MS[Math.min(attempt, BACKOFF_STEPS_MS.length - 1)] ?? BACKOFF_CAP_MS
    const capped = Math.min(base, BACKOFF_CAP_MS)
    return Math.round(capped * (0.5 + random() * 0.5)) // 50%–100% do passo
}

/** Lê `Retry-After` (segundos ou data HTTP). Devolve `undefined` para valor ausente/ilegível. */
function parseRetryAfter(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) return value * 1000
    if (typeof value !== "string" || !value) return undefined

    const asSeconds = Number(value)
    if (Number.isFinite(asSeconds)) return asSeconds * 1000

    const asDate = Date.parse(value)
    if (Number.isFinite(asDate)) return Math.max(0, asDate - Date.now())

    return undefined
}

type ErrorLike = {
    response?: { status?: number; data?: unknown; headers?: Record<string, unknown> }
}

/**
 * Traduz o erro de `GET /auth/refresh-token` em veredito, usando os códigos reais do
 * contrato do backend (§13.1).
 *
 * O caso sem `response` é rede/DNS/offline: **transitório**. Foi o que o código antigo já
 * acertava; o que ele errava era não distinguir o timeout, que cai em "desconhecido".
 */
export function classifyRefreshError(error: unknown): RefreshVerdict {
    if (error instanceof RefreshTimeoutError) {
        return { kind: "unknown", reason: error.message }
    }

    const status = (error as ErrorLike)?.response?.status

    if (typeof status !== "number") {
        // Sem resposta HTTP: não chegou ao servidor, então nada foi consumido.
        const reason = error instanceof Error ? error.message : "Falha de rede"
        return { kind: "transient", reason }
    }

    if (status === 401) return { kind: "terminal", reason: "REFRESH_TOKEN_INVALID", status }
    if (status === 403) return { kind: "terminal", reason: "ACCOUNT_BLOCKED", status }
    if (status === 400) return { kind: "terminal", reason: "BAD_REQUEST", status }

    if (status === 429) {
        const headers = (error as ErrorLike)?.response?.headers ?? {}
        const retryAfterMs = parseRetryAfter(headers["retry-after"] ?? headers["Retry-After"])
        return { kind: "transient", reason: "RATE_LIMITED", status, retryAfterMs }
    }

    // 5xx e qualquer outro status: o backend diz explicitamente que a credencial pode
    // continuar válida num 500. Preservar tokens e tentar de novo.
    return { kind: "transient", reason: `HTTP_${status}`, status }
}

/** Um veredito terminal é o único que desloga (§5.6). */
export function isTerminal(verdict: RefreshVerdict): verdict is Extract<
    RefreshVerdict,
    { kind: "terminal" }
> {
    return verdict.kind === "terminal"
}
