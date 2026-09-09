import type { AxiosError } from "axios"

import api from "@/api"
import { FeedResponse, Moment } from "@/contexts/Feed/types"

/**
 * O `Fetcher` não recebe mais token.
 *
 * Ele guardava o JWT capturado na construção do orquestrador e o mandava no header a cada
 * chunk. Como o feed vive por toda a sessão e o orquestrador só é recriado quando o usuário
 * muda, esse token envelhecia: depois da primeira rotação, **todo** request de feed saía com
 * a credencial antiga — no caminho mais quente do app. E como o header já vinha preenchido,
 * ele vencia o que o interceptor injetaria.
 *
 * Agora quem autentica é o interceptor, a partir da sessão viva (§3.2).
 *
 * ---
 *
 * Sobre o resultado: `fetchChunk` devolve um `FetchOutcome`, não um `Moment[]`.
 *
 * A versão anterior engolia tudo num `catch { return [] }` — e "o servidor não respondeu"
 * ficava indistinguível de "o feed está vazio". O orquestrador tratava os dois como vazio,
 * e num `RESET` (pull-to-refresh) isso trocava a lista inteira por `[]`: **um blip de rede
 * apagava o feed da tela**. É exatamente o cenário de volta do segundo plano, quando a
 * interface de rede ainda não subiu e o primeiro request morre no socket.
 */

/** Orçamento de uma tentativa. Acima disso o request é abortado de verdade, não abandonado. */
const REQUEST_TIMEOUT_MS = 15_000
/** Tentativas por chamada (a primeira + 2 retentativas). */
const MAX_ATTEMPTS = 3
const BASE_BACKOFF_MS = 400
const MAX_BACKOFF_MS = 4_000

export type FetchFailureReason =
    /** Cancelado por quem chamou (`abort()`, desmontagem, novo reload). */
    | "aborted"
    /** Estourou o orçamento de tempo da tentativa. */
    | "timeout"
    /** Nenhuma resposta: DNS, socket, rede caída. */
    | "offline"
    /** 5xx ou 429 — do lado do servidor, vale insistir. */
    | "server"
    /** 4xx — determinístico. Inclui 401, que é do interceptor resolver, não daqui. */
    | "client"
    /** 200 com um corpo que não é um feed. */
    | "malformed"

export type FetchOutcome =
    { ok: true; moments: Moment[] } | { ok: false; reason: FetchFailureReason; status?: number }

const RETRIABLE: ReadonlySet<FetchFailureReason> = new Set<FetchFailureReason>([
    "offline",
    "timeout",
    "server",
])

/**
 * Um item sem `id` utilizável é lixo para todo o resto do pipeline: o `ChunkManager`
 * indexa por id e o `mapper` casa id com moment. Em vez de deixar entrar e quebrar
 * camadas acima, filtramos aqui.
 */
function isUsableMoment(value: unknown): value is Moment {
    if (typeof value !== "object" || value === null) return false
    const id = (value as { id?: unknown }).id
    return typeof id === "string" && id.length > 0
}

/**
 * Espera cancelável. Um `setTimeout` solto continuaria correndo depois de um `abort()`,
 * segurando a retentativa por até 4s antes de descobrir que ninguém mais quer o resultado.
 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        if (signal.aborted) return resolve()
        const timer = setTimeout(finish, ms)
        signal.addEventListener("abort", finish, { once: true })
        function finish() {
            clearTimeout(timer)
            signal.removeEventListener("abort", finish)
            resolve()
        }
    })
}

/**
 * Backoff exponencial com _full jitter_. O jitter não é enfeite: quando a rede volta,
 * todos os apps em segundo plano acordam juntos e retentam no mesmo instante — sem
 * dispersão, a retentativa vira a segunda onda do próprio incidente.
 */
function backoffFor(attempt: number): number {
    const ceiling = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** (attempt - 1))
    return Math.random() * ceiling
}

function classify(error: unknown, timedOut: boolean, aborted: boolean): FetchOutcome {
    if (timedOut) return { ok: false, reason: "timeout" }
    if (aborted) return { ok: false, reason: "aborted" }

    const status = (error as AxiosError)?.response?.status
    if (typeof status === "number") {
        // 429 é "volte depois", não "você errou": entra no balde do servidor.
        if (status >= 500 || status === 429) return { ok: false, reason: "server", status }
        return { ok: false, reason: "client", status }
    }
    return { ok: false, reason: "offline" }
}

export class Fetcher {
    /**
     * Single-flight. Dois `fetch()` simultâneos (scroll no fim da lista + pull-to-refresh,
     * por exemplo) compartilham o mesmo request em vez de disparar dois `/feed`.
     */
    private inFlight: Promise<FetchOutcome> | null = null
    private controller: AbortController | null = null

    public async fetchChunk(): Promise<FetchOutcome> {
        if (this.inFlight) return this.inFlight

        const controller = new AbortController()
        this.controller = controller

        this.inFlight = this.runWithRetries(controller.signal).finally(() => {
            this.inFlight = null
            if (this.controller === controller) this.controller = null
        })

        return this.inFlight
    }

    /** Cancela o request em voo, se houver. Idempotente. */
    public abort(): void {
        this.controller?.abort()
    }

    private async runWithRetries(signal: AbortSignal): Promise<FetchOutcome> {
        let last: FetchOutcome = { ok: false, reason: "offline" }

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            last = await this.attempt(signal)

            if (last.ok) return last
            if (!RETRIABLE.has(last.reason)) return last
            if (attempt === MAX_ATTEMPTS) break

            await delay(backoffFor(attempt), signal)
            if (signal.aborted) return { ok: false, reason: "aborted" }
        }

        return last
    }

    private async attempt(outerSignal: AbortSignal): Promise<FetchOutcome> {
        if (outerSignal.aborted) return { ok: false, reason: "aborted" }

        // Controller próprio da tentativa: o timeout precisa derrubar *este* request sem
        // marcar o chamador como cancelado, e o cancelamento externo precisa atravessar.
        const controller = new AbortController()
        let timedOut = false

        const timer = setTimeout(() => {
            timedOut = true
            controller.abort()
        }, REQUEST_TIMEOUT_MS)

        const forward = () => controller.abort()
        outerSignal.addEventListener("abort", forward, { once: true })

        try {
            const response = await api.get<FeedResponse>("/feed", { signal: controller.signal })
            const body = response?.data

            if (!body?.success || !Array.isArray(body.moments)) {
                return { ok: false, reason: "malformed" }
            }

            return { ok: true, moments: body.moments.filter(isUsableMoment) }
        } catch (error) {
            return classify(error, timedOut, outerSignal.aborted)
        } finally {
            clearTimeout(timer)
            outerSignal.removeEventListener("abort", forward)
        }
    }
}
