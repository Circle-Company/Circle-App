import { beforeEach, describe, expect, it, vi } from "vitest"

import { Credentials, Identity } from "../schema"
import {
    NoRefreshTokenError,
    RefreshRequest,
    RefreshResponse,
    Session,
    SessionDestroyedError,
    SessionEvent,
} from "../session"
import { RefreshTimeoutError } from "../verdict"

const identity: Identity = { userId: "user-1", appleUserId: "apple-1" }

const credentialsAt = (generation: number): Credentials => ({
    accessToken: `access-${generation}`,
    refreshToken: `refresh-${generation}`,
    generation,
    issuedAt: "2026-01-01T00:00:00.000Z",
})

/** Promise controlada à mão — deixa o teste decidir quando a rede responde. */
function deferred<T>() {
    let resolve!: (value: T) => void
    let reject!: (error: unknown) => void
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
}

type Harness = {
    session: Session
    events: SessionEvent[]
    calls: string[]
}

function makeSession(
    refreshRequest: RefreshRequest,
    options: { armed?: boolean; generation?: number } = {},
): Harness {
    const events: SessionEvent[] = []
    const calls: string[] = []

    const session = new Session({
        identity,
        credentials: credentialsAt(options.generation ?? 0),
        refreshRequest: (token) => {
            calls.push(token)
            return refreshRequest(token)
        },
        hooks: { onEvent: (event) => events.push(event) },
        timeoutMs: 50,
    })

    if (options.armed !== false) session.arm()
    return { session, events, calls }
}

const ok = (generation: number): RefreshResponse => ({
    token: `access-${generation}`,
    refreshToken: `refresh-${generation}`,
    expiresIn: 36_000,
})

const httpError = (status: number) => Object.assign(new Error(`HTTP ${status}`), {
    response: { status, headers: {}, data: {} },
})

beforeEach(() => {
    vi.restoreAllMocks()
})

describe("single-flight", () => {
    // O teste mais importante da Fase 2. Cinco refreshes paralelos com o mesmo token
    // disparam a detecção de reuso do backend e revogam a conta inteira (§13.1).
    it("N chamadas concorrentes produzem UMA request e o mesmo resultado", async () => {
        const gate = deferred<RefreshResponse>()
        const { session, calls } = makeSession(() => gate.promise)

        const results = Promise.all([
            session.refresh(),
            session.refresh(),
            session.refresh(),
            session.refresh(),
            session.refresh(),
        ])

        expect(calls).toHaveLength(1)
        gate.resolve(ok(1))

        const settled = await results
        expect(calls).toHaveLength(1)
        expect(new Set(settled)).toHaveProperty("size", 1) // todos receberam o MESMO objeto
    })

    it("a falha também é compartilhada por todos os concorrentes", async () => {
        const gate = deferred<RefreshResponse>()
        const { session, calls } = makeSession(() => gate.promise)

        const a = session.refresh()
        const b = session.refresh()
        gate.reject(httpError(500))

        await expect(a).rejects.toThrow()
        await expect(b).rejects.toThrow()
        expect(calls).toHaveLength(1)
    })

    it("depois de concluir, um novo refresh dispara uma request nova", async () => {
        const { session, calls } = makeSession(async (token) =>
            ok(Number(token.split("-")[1]) + 1),
        )

        await session.refresh()
        await session.refresh()

        expect(calls).toEqual(["refresh-0", "refresh-1"])
    })

    it("o segundo refresh usa o token novo, nunca o já consumido", async () => {
        const { session, calls } = makeSession(async (token) =>
            ok(Number(token.split("-")[1]) + 1),
        )

        await session.refresh()
        await session.refresh()

        expect(calls[1]).toBe("refresh-1")
        expect(calls[1]).not.toBe(calls[0])
    })
})

describe("sucesso", () => {
    it("substitui o par inteiro e incrementa a geração", async () => {
        const { session } = makeSession(async () => ok(1))

        const credentials = await session.refresh()

        expect(credentials).toMatchObject({
            accessToken: "access-1",
            refreshToken: "refresh-1",
            generation: 1,
        })
        expect(session.accessToken).toBe("access-1")
        expect(session.generation).toBe(1)
    })

    it("emite o evento update com as credenciais novas", async () => {
        const { session, events } = makeSession(async () => ok(1))

        await session.refresh()

        expect(events).toEqual([
            { type: "update", credentials: expect.objectContaining({ generation: 1 }) },
        ])
    })

    it("uma resposta 200 sem o par completo é terminal — nada a reter", async () => {
        const { session, events } = makeSession(async () => ({ token: "só-o-access" }))

        await expect(session.refresh()).rejects.toThrow(/par de tokens/)
        expect(events[0]).toMatchObject({
            type: "expired",
            verdict: { reason: "MALFORMED_RESPONSE" },
        })
        expect(session.isDestroyed).toBe(true)
    })
})

describe("falha transitória", () => {
    it("preserva os tokens e NÃO mata a sessão", async () => {
        const { session, events } = makeSession(async () => {
            throw httpError(500)
        })

        await expect(session.refresh()).rejects.toThrow()

        expect(session.isDestroyed).toBe(false)
        expect(session.credentials).toMatchObject({ refreshToken: "refresh-0", generation: 0 })
        expect(events[0]).toMatchObject({ type: "network-error", verdict: { kind: "transient" } })
    })

    it("permite tentar de novo depois", async () => {
        let attempt = 0
        const { session } = makeSession(async () => {
            attempt += 1
            if (attempt === 1) throw httpError(503)
            return ok(1)
        })

        await expect(session.refresh()).rejects.toThrow()
        await expect(session.refresh()).resolves.toMatchObject({ generation: 1 })
    })

    it("erro de rede sem resposta HTTP também é transitório", async () => {
        const { session, events } = makeSession(async () => {
            throw new Error("Network Error")
        })

        await expect(session.refresh()).rejects.toThrow()

        expect(session.isDestroyed).toBe(false)
        expect(events[0]).toMatchObject({ type: "network-error" })
    })
})

describe("falha terminal", () => {
    it("401 mata a sessão e emite expired", async () => {
        const { session, events } = makeSession(async () => {
            throw httpError(401)
        })

        await expect(session.refresh()).rejects.toThrow()

        expect(session.isDestroyed).toBe(true)
        expect(events[0]).toMatchObject({
            type: "expired",
            verdict: { kind: "terminal", reason: "REFRESH_TOKEN_INVALID" },
        })
    })

    it("403 mata a sessão", async () => {
        const { session, events } = makeSession(async () => {
            throw httpError(403)
        })

        await expect(session.refresh()).rejects.toThrow()
        expect(events[0]).toMatchObject({ verdict: { reason: "ACCOUNT_BLOCKED" } })
    })

    // "Nunca faça retry automático de um refresh que falhou com 401" — contrato do backend.
    it("uma sessão morta recusa novo refresh sem tocar na rede", async () => {
        const { session, calls } = makeSession(async () => {
            throw httpError(401)
        })

        await expect(session.refresh()).rejects.toThrow()
        await expect(session.refresh()).rejects.toThrow(SessionDestroyedError)

        expect(calls).toHaveLength(1)
    })

    it("sem refresh token, é terminal e não chega a chamar a rede", async () => {
        const events: SessionEvent[] = []
        const request = vi.fn()
        const session = new Session({
            identity,
            credentials: { ...credentialsAt(0), refreshToken: "" },
            refreshRequest: request as unknown as RefreshRequest,
            hooks: { onEvent: (event) => events.push(event) },
        })
        session.arm()

        await expect(session.refresh()).rejects.toThrow(NoRefreshTokenError)

        expect(request).not.toHaveBeenCalled()
        expect(events[0]).toMatchObject({ verdict: { reason: "NO_REFRESH_TOKEN" } })
    })
})

describe("timeout", () => {
    it("classifica como desconhecido e NÃO mata a sessão", async () => {
        const gate = deferred<RefreshResponse>()
        const { session, events } = makeSession(() => gate.promise)

        await expect(session.refresh()).rejects.toThrow(RefreshTimeoutError)

        expect(session.isDestroyed).toBe(false)
        expect(session.credentials).toMatchObject({ refreshToken: "refresh-0" })
        expect(events[0]).toMatchObject({ type: "network-error", verdict: { kind: "unknown" } })
    })
})

describe("kill", () => {
    it("uma sessão descartada nunca consome o refresh token", async () => {
        const request = vi.fn(async () => ok(1))
        const { session } = makeSession(request)

        session.kill()

        await expect(session.refresh()).rejects.toThrow(SessionDestroyedError)
        expect(request).not.toHaveBeenCalled()
    })

    it("accessToken lança depois do kill, em vez de devolver credencial morta", () => {
        const { session } = makeSession(async () => ok(1))

        session.kill()

        expect(() => session.accessToken).toThrow(SessionDestroyedError)
    })

    it("não emite mais eventos depois de morta", async () => {
        const gate = deferred<RefreshResponse>()
        const { session, events } = makeSession(() => gate.promise)

        const inFlight = session.refresh()
        session.kill()
        gate.resolve(ok(1))
        await inFlight.catch(() => {})

        expect(events).toEqual([])
    })
})

describe("latch armed", () => {
    it("não dispara eventos antes de arm()", async () => {
        const { session, events } = makeSession(async () => ok(1), { armed: false })

        await session.refresh()

        expect(events).toEqual([])
    })

    it("passa a disparar depois de arm()", async () => {
        const { session, events } = makeSession(async () => ok(1), { armed: false })

        session.arm()
        await session.refresh()

        expect(events).toHaveLength(1)
    })
})

describe("hooks que lançam", () => {
    // Sem o try/catch, a promise interna ficaria rejeitada para sempre e toda request
    // futura falharia — com a sessão nunca marcada como morta.
    it("um hook que lança não quebra o refresh nem envenena a sessão", async () => {
        vi.spyOn(console, "warn").mockImplementation(() => {})

        const session = new Session({
            identity,
            credentials: credentialsAt(0),
            refreshRequest: async () => ok(1),
            hooks: {
                onEvent: () => {
                    throw new Error("handler quebrado")
                },
            },
        })
        session.arm()

        await expect(session.refresh()).resolves.toMatchObject({ generation: 1 })
        expect(session.isDestroyed).toBe(false)

        // e a sessão continua utilizável
        await expect(session.refresh()).resolves.toMatchObject({ generation: 2 })
    })
})
