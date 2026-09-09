import { beforeEach, describe, expect, it, vi } from "vitest"

import { makeJwt } from "@/tests/memoryMMKV"

import {
    CONNECTIVITY_WAIT_CAP_MS,
    PROACTIVE_JITTER_MS,
    PROACTIVE_LEAD_MS,
    createRevalidationBarrier,
    type RevalidationDeps,
    type RevalidationTarget,
} from "../revalidation"
import { RefreshTimeoutError } from "../verdict"

/**
 * Dois relógios convivem aqui de propósito.
 *
 * `deps.now()` é o relógio **injetado**, que o teste move à vontade — é com ele que a
 * barreira mede tempo em background e teto de conectividade. Já `isAccessTokenExpired`
 * (que a barreira usa de verdade, sem dublê) lê o relógio real. Por isso os tokens são
 * montados com `exp` relativo a `Date.now()`: assim as duas leituras concordam sem que o
 * teste precise mockar a função que ele quer exercitar.
 */
const validToken = () =>
    makeJwt({ sub: "user-1", exp: Math.floor((Date.now() + 10 * 3_600_000) / 1000) })
const expiredToken = () => makeJwt({ sub: "user-1", exp: Math.floor((Date.now() - 60_000) / 1000) })

type PendingTimer = {
    fn: () => void
    dueAt: number
    delayMs: number
    cancelled: boolean
}

type Harness = {
    barrier: ReturnType<typeof createRevalidationBarrier>
    deps: RevalidationDeps
    refresh: ReturnType<typeof vi.fn>
    timers: PendingTimer[]
    now: () => number
    advance: (ms: number) => void
    setConnected: (value: boolean) => void
    setToken: (token: string | null) => void
    /** Roda timers pendentes até a promise assentar — é o que faz a espera de rede andar. */
    settle: <T>(promise: Promise<T>) => Promise<{ ok: boolean; error?: unknown }>
    runNextTimer: () => boolean
}

function createHarness(
    options: {
        token?: string | null
        connected?: boolean
        refresh?: () => Promise<unknown>
        random?: () => number
        onTerminal?: RevalidationDeps["onTerminal"]
    } = {},
): Harness {
    let clock = Date.now()
    let connected = options.connected ?? true
    let token: string | null = options.token === undefined ? validToken() : options.token

    const timers: PendingTimer[] = []
    const refresh = vi.fn(options.refresh ?? (async () => ({ ok: true })))

    const deps: RevalidationDeps = {
        now: () => clock,
        isConnected: () => connected,
        schedule: (fn, ms) => {
            const timer: PendingTimer = { fn, dueAt: clock + ms, delayMs: ms, cancelled: false }
            timers.push(timer)
            return {
                cancel: () => {
                    timer.cancelled = true
                },
            }
        },
        getSession: () => (token === null ? null : ({ accessToken: token } as RevalidationTarget)),
        refresh: () => refresh(),
        random: options.random,
        onTerminal: options.onTerminal,
    }

    const takeNext = (): PendingTimer | null => {
        let bestIndex = -1
        for (let i = 0; i < timers.length; i++) {
            const timer = timers[i]
            if (timer.cancelled) continue
            if (bestIndex === -1 || timer.dueAt < timers[bestIndex].dueAt) bestIndex = i
        }
        if (bestIndex === -1) return null
        return timers.splice(bestIndex, 1)[0]
    }

    const runNextTimer = (): boolean => {
        const next = takeNext()
        if (!next) return false
        clock = Math.max(clock, next.dueAt)
        next.fn()
        return true
    }

    async function settle<T>(promise: Promise<T>): Promise<{ ok: boolean; error?: unknown }> {
        let done = false
        const tracked = promise.then(
            () => {
                done = true
                return { ok: true }
            },
            (error: unknown) => {
                done = true
                return { ok: false, error }
            },
        )

        let idle = 0
        for (let step = 0; step < 500 && !done; step++) {
            // Macrotask real: garante que todas as microtasks da barreira já rodaram antes
            // de decidirmos se ainda há timer a disparar.
            await new Promise((resolve) => setTimeout(resolve, 0))
            if (done) break
            if (!runNextTimer()) {
                if (++idle > 2) break
            } else {
                idle = 0
            }
        }

        return tracked
    }

    return {
        barrier: createRevalidationBarrier(deps),
        deps,
        refresh,
        timers,
        now: () => clock,
        advance: (ms) => {
            clock += ms
        },
        setConnected: (value) => {
            connected = value
        },
        setToken: (value) => {
            token = value
        },
        settle,
        runNextTimer,
    }
}

const httpError = (status: number) =>
    Object.assign(new Error(`HTTP ${status}`), { response: { status, headers: {}, data: {} } })

/** Deixa as microtasks pendentes rodarem sem mexer no relógio nem nos timers. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

beforeEach(() => {
    vi.restoreAllMocks()
})

describe("barreira", () => {
    it("resolve na hora quando não há revalidação em curso", async () => {
        const { barrier } = createHarness()

        expect(barrier.isOpen).toBe(false)
        await expect(barrier.wait()).resolves.toBeUndefined()
    })

    it("segura as requests enquanto aberta e libera todas ao fechar", async () => {
        const { barrier } = createHarness()
        const liberadas: number[] = []

        barrier.open()
        expect(barrier.isOpen).toBe(true)

        void barrier.wait().then(() => liberadas.push(1))
        void barrier.wait().then(() => liberadas.push(2))

        await flush()
        // O ponto da barreira: nenhuma request saiu, então não há 401 nenhum para tratar.
        expect(liberadas).toEqual([])

        barrier.close()
        await flush()

        expect(liberadas).toEqual([1, 2])
        expect(barrier.isOpen).toBe(false)
    })

    it("open() duplicado não cria uma segunda fila, e close() sem open é inofensivo", async () => {
        const { barrier } = createHarness()
        let liberada = false

        barrier.open()
        barrier.open()
        void barrier.wait().then(() => {
            liberada = true
        })

        barrier.close()
        await flush()
        expect(liberada).toBe(true)

        expect(() => barrier.close()).not.toThrow()
        await expect(barrier.wait()).resolves.toBeUndefined()
    })
})

describe("onForeground — retomada", () => {
    it("retomada curta com token válido não abre a barreira nem refresca", async () => {
        const h = createHarness({ token: validToken() })

        const result = await h.settle(h.barrier.onForeground(h.now() - 5_000))

        expect(result.ok).toBe(true)
        expect(h.refresh).not.toHaveBeenCalled()
        expect(h.barrier.isOpen).toBe(false)
        // Nem sondagem de rede: o caminho comum de trocar de app e voltar custa zero.
        expect(h.timers).toHaveLength(0)
    })

    it("retomada curta com token JÁ expirado refresca assim mesmo", async () => {
        const h = createHarness({ token: expiredToken() })

        const result = await h.settle(h.barrier.onForeground(h.now() - 5_000))

        expect(result.ok).toBe(true)
        expect(h.refresh).toHaveBeenCalledTimes(1)
    })

    it("retomada longa com token expirado refresca e libera com o token novo", async () => {
        const h = createHarness({ token: expiredToken() })
        const seisHoras = 6 * 3_600_000

        const promise = h.barrier.onForeground(h.now() - seisHoras)
        // A barreira já está aberta na primeira volta do event loop — antes de qualquer
        // request sair. É o "sabe antes" que substitui o "descobre pelo 401".
        expect(h.barrier.isOpen).toBe(true)

        const ordem: string[] = []
        void h.barrier.wait().then(() => ordem.push("request"))
        h.refresh.mockImplementation(async () => {
            ordem.push("refresh")
            return { ok: true }
        })

        const result = await h.settle(promise)
        await flush()

        expect(result.ok).toBe(true)
        expect(h.refresh).toHaveBeenCalledTimes(1)
        // A request só sai depois da rotação — nunca com o token morto.
        expect(ordem).toEqual(["refresh", "request"])
        expect(h.barrier.isOpen).toBe(false)
    })

    it("retomada longa com token ainda válido abre a barreira mas não gasta uma rotação", async () => {
        const h = createHarness({ token: validToken() })

        const result = await h.settle(h.barrier.onForeground(h.now() - 10 * 60_000))

        expect(result.ok).toBe(true)
        expect(h.refresh).not.toHaveBeenCalled()
        expect(h.barrier.isOpen).toBe(false)
    })

    it("sem `backgroundedAt` trata como suspensão longa (o lado seguro)", async () => {
        const h = createHarness({ token: expiredToken() })

        await h.settle(h.barrier.onForeground(null))

        expect(h.refresh).toHaveBeenCalledTimes(1)
    })

    it("deslogado não revalida nada", async () => {
        const h = createHarness({ token: null })

        const result = await h.settle(h.barrier.onForeground(h.now() - 6 * 3_600_000))

        expect(result.ok).toBe(true)
        expect(h.refresh).not.toHaveBeenCalled()
        expect(h.barrier.isOpen).toBe(false)
    })

    it("duas retomadas concorrentes compartilham UMA revalidação", async () => {
        const h = createHarness({ token: expiredToken() })

        const a = h.barrier.onForeground(null)
        const b = h.barrier.onForeground(null)

        await h.settle(Promise.all([a, b]))

        // Refresh token é de uso único: duas rotações do mesmo token revogam a conta (§13.1).
        expect(h.refresh).toHaveBeenCalledTimes(1)
    })
})

describe("onForeground — conectividade", () => {
    it("sem rede dentro do teto de 10s, libera assim mesmo", async () => {
        const h = createHarness({ token: expiredToken(), connected: false })
        const inicio = h.now()

        const result = await h.settle(h.barrier.onForeground(null))

        expect(result.ok).toBe(true)
        // Não adianta renovar offline; segurar mais tempo só troca erro de rede por app travado.
        expect(h.refresh).not.toHaveBeenCalled()
        expect(h.barrier.isOpen).toBe(false)
        expect(h.now() - inicio).toBeGreaterThanOrEqual(CONNECTIVITY_WAIT_CAP_MS)
    })

    it("rede que volta dentro do teto dispara o refresh", async () => {
        const h = createHarness({ token: expiredToken(), connected: false })
        let sondagens = 0
        h.deps.isConnected = () => {
            sondagens += 1
            return sondagens > 3
        }

        const result = await h.settle(h.barrier.onForeground(null))

        expect(result.ok).toBe(true)
        expect(h.refresh).toHaveBeenCalledTimes(1)
        expect(h.now()).toBeLessThan(Date.now() + CONNECTIVITY_WAIT_CAP_MS)
    })

    it("`isConnected` que lança conta como offline e não derruba a retomada", async () => {
        const h = createHarness({ token: expiredToken() })
        h.deps.isConnected = () => {
            throw new Error("NetInfo indisponível")
        }

        const result = await h.settle(h.barrier.onForeground(null))

        expect(result.ok).toBe(true)
        expect(h.refresh).not.toHaveBeenCalled()
        expect(h.barrier.isOpen).toBe(false)
    })

    it("token rotacionado por outro caminho durante a espera de rede cancela o refresh", async () => {
        const h = createHarness({ token: expiredToken(), connected: false })
        let sondagens = 0
        h.deps.isConnected = () => {
            sondagens += 1
            // Enquanto esperávamos a rede, um 401 reativo já renovou o par.
            if (sondagens === 2) h.setToken(validToken())
            return sondagens > 2
        }

        await h.settle(h.barrier.onForeground(null))

        expect(h.refresh).not.toHaveBeenCalled()
    })
})

describe("onForeground — classificação da falha", () => {
    it("transitório não bloqueia: fecha a barreira e libera assim mesmo", async () => {
        const h = createHarness({
            token: expiredToken(),
            refresh: async () => {
                throw new Error("Network Error")
            },
        })
        let liberada = false

        const promise = h.barrier.onForeground(null)
        void h.barrier.wait().then(() => {
            liberada = true
        })

        const result = await h.settle(promise)
        await flush()

        // As requests falham em rede, não em auth — e o React Query as repete depois.
        expect(result.ok).toBe(true)
        expect(liberada).toBe(true)
        expect(h.barrier.isOpen).toBe(false)
    })

    it("desconhecido (timeout local) nunca é terminal", async () => {
        const h = createHarness({
            token: expiredToken(),
            refresh: async () => {
                throw new RefreshTimeoutError(30_000)
            },
        })

        const result = await h.settle(h.barrier.onForeground(null))

        expect(result.ok).toBe(true)
        expect(h.barrier.isOpen).toBe(false)
    })

    it("429 é transitório e não propaga", async () => {
        const h = createHarness({
            token: expiredToken(),
            refresh: async () => {
                throw httpError(429)
            },
        })

        const result = await h.settle(h.barrier.onForeground(null))

        expect(result.ok).toBe(true)
    })

    it("terminal (401) propaga para o chamador — e ainda assim fecha a barreira", async () => {
        const h = createHarness({
            token: expiredToken(),
            refresh: async () => {
                throw httpError(401)
            },
        })
        let liberada = false

        const promise = h.barrier.onForeground(null)
        void h.barrier.wait().then(() => {
            liberada = true
        })

        const result = await h.settle(promise)
        await flush()

        expect(result.ok).toBe(false)
        expect(result.error).toMatchObject({ response: { status: 401 } })
        // Quem desloga é o chamador; prender a barreira só congelaria a UI até lá.
        expect(h.barrier.isOpen).toBe(false)
        expect(liberada).toBe(true)
    })
})

describe("agendamento proativo", () => {
    const exp = () => Date.now() + 10 * 3_600_000

    it("agenda para exp - 60s - jitter, com o jitter dentro de 0..10s", () => {
        for (const valor of [0, 0.25, 0.5, 0.999_999]) {
            const h = createHarness({ random: () => valor })
            const expMs = exp()

            const agendamento = h.barrier.scheduleProactiveRefresh(expMs)

            expect(agendamento.jitterMs).toBeGreaterThanOrEqual(0)
            expect(agendamento.jitterMs).toBeLessThan(PROACTIVE_JITTER_MS)
            expect(agendamento.targetMs).toBe(expMs - PROACTIVE_LEAD_MS - agendamento.jitterMs)
            expect(agendamento.delayMs).toBe(agendamento.targetMs - h.now())
        }
    })

    it("random fora da faixa não produz alvo absurdo", () => {
        const h = createHarness({ random: () => Number.NaN })
        const expMs = exp()

        const agendamento = h.barrier.scheduleProactiveRefresh(expMs)

        expect(agendamento.jitterMs).toBe(0)
        expect(agendamento.targetMs).toBe(expMs - PROACTIVE_LEAD_MS)
    })

    it("timer que 'dormiu' dispara imediatamente em vez de reagendar", async () => {
        const h = createHarness({ random: () => 0 })
        // O cenário literal do §5.5: um timer agendado para dali a ~20 min.
        const agendamento = h.barrier.scheduleProactiveRefresh(Date.now() + 20 * 60_000)
        expect(agendamento.delayMs).toBeGreaterThan(0)

        // O processo ficou suspenso seis horas: o `setTimeout` não contou esse tempo, mas o
        // relógio andou. Quando o callback finalmente roda, o alvo já passou.
        h.advance(6 * 3_600_000)
        const timer = h.timers[0]
        h.timers.length = 0
        timer.fn()

        await h.settle(Promise.resolve())

        expect(h.refresh).toHaveBeenCalledTimes(1)
        // Disparou agora, não reagendou para o horário original.
        expect(h.timers.filter((t) => !t.cancelled)).toHaveLength(0)
    })

    it("timer que disparou cedo reagenda pelo que falta segundo o exp", async () => {
        const h = createHarness({ random: () => 0 })
        const expMs = exp()
        const agendamento = h.barrier.scheduleProactiveRefresh(expMs)

        // Dispara sem o relógio ter andado: o alvo ainda está no futuro.
        const timer = h.timers[0]
        h.timers.length = 0
        timer.fn()
        await flush()

        expect(h.refresh).not.toHaveBeenCalled()
        expect(h.timers).toHaveLength(1)
        expect(h.timers[0].dueAt).toBe(agendamento.targetMs)
    })

    it("alvo já no passado agenda com atraso zero", () => {
        const h = createHarness({ random: () => 0 })

        const agendamento = h.barrier.scheduleProactiveRefresh(Date.now() - 3_600_000)

        expect(agendamento.delayMs).toBe(0)
        expect(h.timers[0].delayMs).toBe(0)
    })

    it("um agendamento novo cancela o anterior", () => {
        const h = createHarness({ random: () => 0 })

        h.barrier.scheduleProactiveRefresh(exp())
        h.barrier.scheduleProactiveRefresh(exp() + 60_000)

        expect(h.timers.filter((t) => !t.cancelled)).toHaveLength(1)
    })

    it("cancelProactiveRefresh impede o disparo", () => {
        const h = createHarness({ random: () => 0 })

        h.barrier.scheduleProactiveRefresh(exp()).cancel()

        expect(h.timers.every((t) => t.cancelled)).toBe(true)
    })

    it("o refresh proativo renova mesmo com o token ainda dentro da margem de skew", async () => {
        // Às `exp - 60s` o token AINDA é válido para `isAccessTokenExpired` (margem de 30s).
        // Se o disparo proativo respeitasse essa checagem, ele nunca renovaria nada.
        const h = createHarness({ token: validToken(), random: () => 0 })
        h.barrier.scheduleProactiveRefresh(Date.now() - 1_000)

        const timer = h.timers[0]
        h.timers.length = 0
        timer.fn()
        await h.settle(Promise.resolve())

        expect(h.refresh).toHaveBeenCalledTimes(1)
    })

    it("veredito terminal no disparo proativo vai para onTerminal, não vira unhandled rejection", async () => {
        const onTerminal = vi.fn()
        const h = createHarness({
            token: expiredToken(),
            random: () => 0,
            refresh: async () => {
                throw httpError(401)
            },
            onTerminal,
        })
        h.barrier.scheduleProactiveRefresh(Date.now() - 1_000)

        const timer = h.timers[0]
        h.timers.length = 0
        timer.fn()
        await h.settle(Promise.resolve())
        await flush()

        expect(onTerminal).toHaveBeenCalledTimes(1)
        expect(onTerminal.mock.calls[0][0]).toMatchObject({
            kind: "terminal",
            reason: "REFRESH_TOKEN_INVALID",
        })
    })
})
