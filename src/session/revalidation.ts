import { isAccessTokenExpired } from "./jwt"
import { classifyRefreshError, isTerminal, type RefreshVerdict } from "./verdict"

/**
 * Refresh proativo e barreira de retomada. Ver `docs/session-management.md` §5.5.
 *
 * O bug que isto corrige: ao voltar do background o app dispara N requests em paralelo com
 * um token que morreu enquanto o processo estava suspenso, toma N × 401, e a rajada de 401
 * queima o `_retry` de cada request e dispara rotações concorrentes de um refresh token de
 * uso único. A barreira inverte a ordem — o app **sabe** que precisa renovar antes de
 * mandar a primeira request, em vez de **descobrir** pelo erro.
 *
 * Nada de `AppState` nem de `NetInfo` aqui: relógio, conectividade, timers, sessão e
 * refresh entram todos por injeção. Não é purismo — é o que permite testar a retomada de
 * seis horas sem esperar seis horas, e o que faz o módulo rodar no vitest, onde importar
 * `react-native` quebra na sintaxe Flow.
 */

/** A partir de quanto tempo em background a retomada precisa revalidar (§13.3). */
export const SHORT_BACKGROUND_MS = 30_000

/** Teto esperando a rede voltar antes de liberar as requests assim mesmo (§13.3). */
export const CONNECTIVITY_WAIT_CAP_MS = 10_000

/** Intervalo entre sondagens de conectividade dentro do teto acima. */
export const CONNECTIVITY_POLL_MS = 250

/** Antecedência do refresh proativo em relação ao `exp` (§13.3). */
export const PROACTIVE_LEAD_MS = 60_000

/** Faixa do jitter somado à antecedência: 0 a 10s (§13.3). */
export const PROACTIVE_JITTER_MS = 10_000

export type ScheduledTask = {
    cancel: () => void
}

/**
 * O mínimo que a revalidação precisa da sessão. Estrutural de propósito: a `Session` real
 * satisfaz isto sem que este módulo dependa dela — e o teste satisfaz com um objeto literal.
 */
export type RevalidationTarget = {
    readonly accessToken: string
}

export type RevalidationDeps = {
    /** Relógio. Em produção, o `now()` de `./jwt` (corrigido pelo offset do servidor). */
    now: () => number
    /** Estado da rede — `NetworkContext` / NetInfo, injetado. */
    isConnected: () => boolean | Promise<boolean>
    /** Agendador. Em produção `setTimeout`; no teste, um relógio que o teste controla. */
    schedule: (fn: () => void, ms: number) => ScheduledTask
    /** A sessão corrente, ou `null` quando deslogado. Lida de novo a cada decisão. */
    getSession: () => RevalidationTarget | null
    /** Rotaciona o par. Deve ser o single-flight da própria `Session`. */
    refresh: () => Promise<unknown>
    /** Injetável para o teste fixar o jitter. */
    random?: () => number
    /**
     * Chamado quando o refresh **proativo** recebe veredito terminal. O foreground propaga
     * o erro para quem o chamou; o timer não tem para quem propagar, e uma rejeição solta
     * num callback de timer vira unhandled rejection.
     */
    onTerminal?: (verdict: RefreshVerdict, error: unknown) => void
}

export type ProactiveSchedule = {
    /** Instante alvo, já com o jitter descontado. */
    targetMs: number
    /** Atraso pedido ao agendador. Zero quando o alvo já passou. */
    delayMs: number
    jitterMs: number
    cancel: () => void
}

export type RevalidationBarrier = {
    /** `true` enquanto houver revalidação em curso — isto é, enquanto as requests esperam. */
    readonly isOpen: boolean
    /**
     * O que o **interceptor de request** aguarda antes de deixar a request sair. Resolve na
     * hora quando não há revalidação em curso, então o custo no caminho comum é uma promise
     * já resolvida.
     */
    wait: () => Promise<void>
    /** Barra as requests. Nome do doc: "abrir a barreira" é bloquear, não liberar. */
    open: () => void
    /** Libera as requests que estavam esperando. */
    close: () => void
    /**
     * `AppState` → `active`. Recebe o instante em que o app foi para background (`null`
     * quando não se sabe, o que é tratado como suspensão longa — o lado seguro).
     *
     * Rejeita **apenas** com veredito terminal; é o único caso que desloga (§5.6).
     */
    onForeground: (backgroundedAtMs: number | null) => Promise<void>
    /** Agenda o refresh para `exp - 60s - jitter(0..10s)`. Substitui o agendamento anterior. */
    scheduleProactiveRefresh: (expMs: number) => ProactiveSchedule
    cancelProactiveRefresh: () => void
}

const clamp01 = (value: number): number =>
    Number.isFinite(value) ? Math.min(Math.max(value, 0), 1) : 0

/** Um erro já carimbado com o veredito pela camada de refresh tem prioridade sobre o palpite. */
function verdictOf(error: unknown): RefreshVerdict {
    const carried = (error as { verdict?: RefreshVerdict } | null)?.verdict
    if (carried && typeof carried.kind === "string") return carried
    return classifyRefreshError(error)
}

export function createRevalidationBarrier(deps: RevalidationDeps): RevalidationBarrier {
    const resolved = Promise.resolve()

    let barrierOpen = false
    let gate: Promise<void> | null = null
    let release: (() => void) | null = null

    let inFlight: Promise<void> | null = null
    let proactive: ScheduledTask | null = null

    function openBarrier(): void {
        if (barrierOpen) return
        barrierOpen = true
        gate = new Promise<void>((resolve) => {
            release = resolve
        })
    }

    function closeBarrier(): void {
        if (!barrierOpen) return
        barrierOpen = false

        const resolve = release
        gate = null
        release = null
        // Liberar por último: quem acordar aqui já enxerga a barreira fechada, e não há
        // instante em que um waiter reentrante reabra a fila que acabou de ser esvaziada.
        resolve?.()
    }

    function wait(): Promise<void> {
        return gate ?? resolved
    }

    function delay(ms: number): Promise<void> {
        return new Promise<void>((resolve) => {
            deps.schedule(() => resolve(), ms)
        })
    }

    async function isConnectedSafe(): Promise<boolean> {
        try {
            return (await deps.isConnected()) === true
        } catch {
            // Não saber o estado da rede não pode travar a retomada; conta como offline e
            // o teto resolve.
            return false
        }
    }

    /**
     * Espera a rede com teto de 10s. Devolve `false` no estouro — e o chamador libera as
     * requests assim mesmo: segurá-las além disso troca "erro de rede na tela" por "app
     * travado", e o refresh reativo (401) continua de pé como rede de segurança.
     */
    async function waitForConnectivity(): Promise<boolean> {
        const deadline = deps.now() + CONNECTIVITY_WAIT_CAP_MS
        // Teto de iterações além do teto de tempo: um agendador injetado que não faça o
        // relógio andar não pode virar laço infinito dentro do caminho de recuperação.
        const maxPolls = Math.ceil(CONNECTIVITY_WAIT_CAP_MS / CONNECTIVITY_POLL_MS) + 1

        for (let poll = 0; poll <= maxPolls; poll++) {
            if (await isConnectedSafe()) return true
            if (deps.now() >= deadline) return false
            await delay(CONNECTIVITY_POLL_MS)
        }

        return false
    }

    function isTokenExpired(session: RevalidationTarget): boolean {
        try {
            // ⚠️ Só o access token passa por aqui. O refresh token é emitido sem claim
            // `exp`, e "sem exp" significa "expirado" para esta função (ver ./jwt).
            return isAccessTokenExpired(session.accessToken)
        } catch {
            // O getter de `accessToken` lança quando a sessão foi descartada. Tratar como
            // expirado deixa o `refresh` falhar com o erro real em vez de mascará-lo aqui.
            return true
        }
    }

    async function run(force: boolean): Promise<void> {
        openBarrier()
        try {
            if (!(await waitForConnectivity())) return

            const session = deps.getSession()
            if (!session) return

            // Recalculado DEPOIS da espera de rede: até 10s se passaram, e nesse intervalo
            // o token pode ter sido rotacionado por outro caminho (um 401 reativo de uma
            // request que já estava em voo).
            if (!force && !isTokenExpired(session)) return

            await deps.refresh()
        } catch (error) {
            const verdict = verdictOf(error)

            // Terminal é o único que desloga, e quem desloga é o chamador — a barreira não
            // conhece o store nem a navegação.
            if (isTerminal(verdict)) throw error

            // Transitório e desconhecido liberam assim mesmo: as requests falham em rede,
            // não em auth, e o React Query as repete quando a conexão voltar. Deslogar aqui
            // é exatamente o erro que o §5.6 existe para impedir.
        } finally {
            // Fecha inclusive no terminal: o logout descarta o bundle logo em seguida, e
            // uma barreira presa aberta congelaria a UI enquanto isso não acontece.
            closeBarrier()
        }
    }

    /**
     * Single-flight da revalidação. O timer proativo e a volta do background podem acordar
     * juntos (o app foi suspenso justamente na janela do refresh) — duas rotações do mesmo
     * refresh token de uso único disparam a detecção de reuso e revogam a conta (§13.1).
     */
    function revalidate(force: boolean): Promise<void> {
        if (inFlight) return inFlight

        inFlight = run(force).finally(() => {
            inFlight = null
        })
        return inFlight
    }

    async function onForeground(backgroundedAtMs: number | null): Promise<void> {
        const session = deps.getSession()
        if (!session) return // deslogado: não há o que revalidar

        const elapsed =
            typeof backgroundedAtMs === "number" && Number.isFinite(backgroundedAtMs)
                ? Math.max(0, deps.now() - backgroundedAtMs)
                : Number.POSITIVE_INFINITY

        // Trocar de app e voltar em cinco segundos é o caso esmagadoramente comum. Abrir a
        // barreira nele custaria latência em todo switch de app sem renovar nada — mas só
        // vale enquanto o token realmente aguenta, por isso as duas condições.
        if (elapsed < SHORT_BACKGROUND_MS && !isTokenExpired(session)) return

        await revalidate(false)
    }

    function cancelProactiveRefresh(): void {
        proactive?.cancel()
        proactive = null
    }

    function fireProactive(targetMs: number): void {
        proactive = null

        // O timer **nunca** é fonte de verdade. `setTimeout` não conta tempo suspenso de
        // forma confiável em iOS/Android: ele tanto dispara tarde (dormiu seis horas) —
        // caso em que o alvo já passou e o refresh vai agora — quanto cedo, e aí a única
        // resposta certa é reagendar pelo que falta segundo o `exp`, não renovar antes da
        // hora e gastar uma rotação.
        const remaining = targetMs - deps.now()
        if (remaining > 0) {
            proactive = deps.schedule(() => fireProactive(targetMs), remaining)
            return
        }

        void revalidate(true).catch((error) => {
            const verdict = verdictOf(error)
            if (isTerminal(verdict)) deps.onTerminal?.(verdict, error)
        })
    }

    function scheduleProactiveRefresh(expMs: number): ProactiveSchedule {
        cancelProactiveRefresh()

        const random = deps.random ?? Math.random
        // O jitter evita que todos os devices renovem no mesmo segundo depois de um deploy
        // — uma estampida de refresh no backend é o custo de não tê-lo.
        const jitterMs = Math.floor(clamp01(random()) * PROACTIVE_JITTER_MS)
        const targetMs = expMs - PROACTIVE_LEAD_MS - jitterMs
        const delayMs = Math.max(0, targetMs - deps.now())

        proactive = deps.schedule(() => fireProactive(targetMs), delayMs)

        return { targetMs, delayMs, jitterMs, cancel: cancelProactiveRefresh }
    }

    return {
        get isOpen() {
            return barrierOpen
        },
        wait,
        open: openBarrier,
        close: closeBarrier,
        onForeground,
        scheduleProactiveRefresh,
        cancelProactiveRefresh,
    }
}
