import { beforeEach, describe, expect, it, vi } from "vitest"

// Este arquivo testa o módulo real, não o mock global de `@/api` do test-setup.
vi.unmock("@/api")
vi.unmock("@/api/index")

// ──────────────────────────────────────────────────────────────────────────────
// Storage em memória: o fluxo de refresh lê e escreve token direto no MMKV, e
// os testes precisam controlar esse estado.
// ──────────────────────────────────────────────────────────────────────────────
const memory = new Map<string, string>()

vi.mock("@/store", () => ({
    storage: {
        getString: (k: string) => memory.get(k),
        set: (k: string, v: string) => void memory.set(k, String(v)),
        remove: (k: string) => void memory.delete(k),
        getBoolean: () => false,
        getNumber: () => 0,
    },
    safeDelete: (k: string) => void memory.delete(k),
    safeSet: (k: string, v: any) => {
        if (v === undefined || v === null) memory.delete(k)
        else memory.set(k, String(v))
    },
    storageKeys: () => ({
        baseKey: "@circle:",
        account: {
            jwt: {
                token: "jwt:token",
                refreshToken: "jwt:refresh",
                expiration: "jwt:expiration",
            },
        },
    }),
}))

// O mock de `persist.account` saiu junto com a store: os tokens não são mais espelhados em
// Zustand nenhum. A `Session` é o único dono deles (§11.2).

// ──────────────────────────────────────────────────────────────────────────────
// Axios: captura os interceptors registrados no import do módulo, para poder
// disparar o handler de erro manualmente.
// ──────────────────────────────────────────────────────────────────────────────
const captured: { onResponseError?: (e: any) => any } = {}
const instanceGet = vi.hoisted(() => vi.fn())

vi.mock("axios", () => {
    const instance: any = vi.fn((cfg: any) => Promise.resolve({ config: cfg, replayed: true }))
    instance.get = instanceGet
    instance.defaults = { headers: { common: {} } }
    instance.interceptors = {
        request: { use: vi.fn() },
        response: {
            use: (_ok: any, err: any) => {
                captured.onResponseError = err
            },
        },
    }
    return { default: { create: () => instance } }
})

/** Erro 401 no formato que o axios entrega ao interceptor. */
/**
 * O `tokenGeneration` é o que o interceptor de request carimba em toda request. Um 401 com
 * geração ANTERIOR à corrente significa "esta request saiu antes da rotação" e é apenas
 * repetida; só a geração corrente justifica um refresh novo (§5.4).
 */
function unauthorized(url = "/account", tokenGeneration = 0) {
    return {
        config: { url, headers: {}, tokenGeneration },
        response: {
            status: 401,
            data: { success: false, code: "AUTHENTICATION_REQUIRED" },
        },
    }
}

let api: typeof import("@/api")

beforeEach(async () => {
    memory.clear()
    instanceGet.mockReset()
    vi.resetModules()
    api = await import("@/api")
    api.resetSessionExpiredLatch()
})

describe("fluxo de 401 → refresh", () => {
    it("sem token nem refreshToken, avisa sessão expirada sem chamar a rota de refresh", async () => {
        const onExpired = vi.fn()
        api.onSessionExpired(onExpired)

        await expect(captured.onResponseError!(unauthorized())).rejects.toBeDefined()

        expect(onExpired).toHaveBeenCalledTimes(1)
        // Não faz sentido tentar renovar quando não há o que renovar.
        expect(instanceGet).not.toHaveBeenCalled()
    })

    it("com token mas sem refreshToken, trata como sessão expirada e limpa o storage", async () => {
        memory.set("jwt:token", "token-velho")
        const onExpired = vi.fn()
        api.onSessionExpired(onExpired)

        await expect(captured.onResponseError!(unauthorized())).rejects.toThrow(/NO_REFRESH_TOKEN/)

        expect(onExpired).toHaveBeenCalledTimes(1)
        expect(memory.has("jwt:token")).toBe(false)
    })

    it("renova o token e repete a request original", async () => {
        memory.set("jwt:token", "token-velho")
        memory.set("jwt:refresh", "refresh-bom")
        instanceGet.mockResolvedValue({
            status: 200,
            data: { token: "token-novo", refreshToken: "refresh-novo", expiresIn: 3600 },
        })

        const result: any = await captured.onResponseError!(unauthorized())

        // `ownAuth` impede o interceptor de sobrescrever este header com o ACCESS token —
        // sem ele o refresh sairia autenticado com a credencial errada.
        expect(instanceGet).toHaveBeenCalledWith("/auth/refresh-token", {
            headers: { Authorization: "Bearer refresh-bom" },
            ownAuth: true,
        })
        expect(memory.get("jwt:token")).toBe("token-novo")
        expect(memory.get("jwt:refresh")).toBe("refresh-novo")
        // A request original é reenviada com o token novo.
        expect(result.config.headers.Authorization).toBe("Bearer token-novo")
    })

    it("401 na própria rota de refresh é terminal: limpa tokens e desloga", async () => {
        memory.set("jwt:token", "token-velho")
        memory.set("jwt:refresh", "refresh-morto")
        instanceGet.mockRejectedValue({ response: { status: 401 } })

        const onExpired = vi.fn()
        api.onSessionExpired(onExpired)

        await expect(captured.onResponseError!(unauthorized())).rejects.toThrow(/REFRESH_REJECTED/)

        expect(onExpired).toHaveBeenCalledTimes(1)
        expect(memory.has("jwt:token")).toBe(false)
        expect(memory.has("jwt:refresh")).toBe(false)
    })

    it("falha de rede no refresh é transitória: preserva os tokens e não desloga", async () => {
        memory.set("jwt:token", "token-velho")
        memory.set("jwt:refresh", "refresh-bom")
        instanceGet.mockRejectedValue(new Error("Network Error"))

        const onExpired = vi.fn()
        api.onSessionExpired(onExpired)

        await expect(captured.onResponseError!(unauthorized())).rejects.toThrow(/Network Error/)

        expect(onExpired).not.toHaveBeenCalled()
        expect(memory.get("jwt:refresh")).toBe("refresh-bom")
    })

    it("dispara um único refresh para várias requests concorrentes", async () => {
        memory.set("jwt:token", "token-velho")
        memory.set("jwt:refresh", "refresh-bom")

        let release: (v: any) => void = () => {}
        instanceGet.mockReturnValue(
            new Promise((resolve) => {
                release = resolve
            }),
        )

        const inFlight = [
            captured.onResponseError!(unauthorized("/a")),
            captured.onResponseError!(unauthorized("/b")),
            captured.onResponseError!(unauthorized("/c")),
        ]

        release({
            status: 200,
            data: { token: "token-novo", refreshToken: "refresh-novo", expiresIn: 3600 },
        })
        const results: any[] = await Promise.all(inFlight)

        // Single-flight: uma chamada só, e as três requests são reenviadas.
        expect(instanceGet).toHaveBeenCalledTimes(1)
        results.forEach((r) => expect(r.config.headers.Authorization).toBe("Bearer token-novo"))
    })

    it("rejeita as requests enfileiradas quando o refresh falha, sem reenviar com token vazio", async () => {
        memory.set("jwt:token", "token-velho")
        memory.set("jwt:refresh", "refresh-bom")

        let reject: (e: any) => void = () => {}
        instanceGet.mockReturnValue(
            new Promise((_resolve, rej) => {
                reject = rej
            }),
        )

        const first = captured.onResponseError!(unauthorized("/a"))
        const queued = captured.onResponseError!(unauthorized("/b"))

        reject({ response: { status: 401 } })

        await expect(first).rejects.toThrow(/REFRESH_REJECTED/)
        // A enfileirada precisa falhar também — antes ela era reenviada com
        // `Bearer ` vazio, gerando outra rodada de 401.
        await expect(queued).rejects.toThrow(/REFRESH_REJECTED/)
    })

    it("notifica sessão expirada uma única vez mesmo com 401 em rajada", async () => {
        const onExpired = vi.fn()
        api.onSessionExpired(onExpired)

        await Promise.allSettled([
            captured.onResponseError!(unauthorized("/a")),
            captured.onResponseError!(unauthorized("/b")),
            captured.onResponseError!(unauthorized("/c")),
        ])

        expect(onExpired).toHaveBeenCalledTimes(1)
    })

    it("não tenta refresh em erro que não é 401", async () => {
        memory.set("jwt:refresh", "refresh-bom")
        const serverError = {
            config: { url: "/account", headers: {} },
            response: { status: 500, data: {} },
        }

        await expect(captured.onResponseError!(serverError)).rejects.toBeDefined()
        expect(instanceGet).not.toHaveBeenCalled()
    })

    // O refresh token é de uso único: o que enviamos já foi consumido no servidor. Uma
    // resposta sem o par completo não deixa nada com que renovar da próxima vez, e guardar
    // o token antigo só faria a próxima tentativa disparar a detecção de reuso — que revoga
    // todas as sessões do usuário. Melhor deslogar limpo.
    it("resposta 200 sem refreshToken é terminal, não é aproveitada pela metade", async () => {
        memory.set("jwt:token", "token-velho")
        memory.set("jwt:refresh", "refresh-bom")
        instanceGet.mockResolvedValue({ status: 200, data: { token: "só-o-access" } })

        await expect(captured.onResponseError!(unauthorized("/account"))).rejects.toThrow(
            /REFRESH_REJECTED/,
        )

        expect(memory.get("jwt:token")).toBeUndefined()
        expect(memory.get("jwt:refresh")).toBeUndefined()
    })

    it("grava o par novo inteiro, nunca só metade", async () => {
        memory.set("jwt:token", "token-velho")
        memory.set("jwt:refresh", "refresh-velho")
        instanceGet.mockResolvedValue({
            status: 200,
            data: { token: "token-novo", refreshToken: "refresh-novo", expiresIn: 3600 },
        })

        await captured.onResponseError!(unauthorized("/account"))

        expect(memory.get("jwt:token")).toBe("token-novo")
        expect(memory.get("jwt:refresh")).toBe("refresh-novo")
    })

    // A regra que sozinha resolve a maior parte da rajada de retomada do background: as
    // requests que saíram ANTES do refresh terminar são repetidas, não viram gatilho de
    // uma segunda rotação — que, com token de uso único, é uma rotação que pode se perder.
    it("401 de geração antiga é repetido sem disparar refresh", async () => {
        memory.set("jwt:token", "token-velho")
        memory.set("jwt:refresh", "refresh-1")
        instanceGet.mockResolvedValue({
            status: 200,
            data: { token: "token-2", refreshToken: "refresh-2", expiresIn: 3600 },
        })
        await captured.onResponseError!(unauthorized("/a", 0))
        expect(instanceGet).toHaveBeenCalledTimes(1)

        // Uma request que saiu antes da rotação chega atrasada com 401 da geração 0.
        const atrasada: any = await captured.onResponseError!(unauthorized("/atrasada", 0))

        expect(instanceGet).toHaveBeenCalledTimes(1) // nenhuma rotação a mais
        expect(atrasada.config.headers.Authorization).toBe("Bearer token-2")
    })

    // Com detecção de reuso no backend, um segundo refresh usando o token já consumido
    // revogaria a conta inteira.
    it("um refresh subsequente usa o token rotacionado, nunca o consumido", async () => {
        memory.set("jwt:token", "token-velho")
        memory.set("jwt:refresh", "refresh-1")
        instanceGet.mockResolvedValue({
            status: 200,
            data: { token: "token-2", refreshToken: "refresh-2", expiresIn: 3600 },
        })
        await captured.onResponseError!(unauthorized("/a"))

        instanceGet.mockResolvedValue({
            status: 200,
            data: { token: "token-3", refreshToken: "refresh-3", expiresIn: 3600 },
        })
        // Geração 1: uma request que já saiu COM o token rotacionado e mesmo assim tomou
        // 401 — aí sim há motivo para renovar de novo.
        await captured.onResponseError!(unauthorized("/b", 1))

        const enviados = instanceGet.mock.calls.map(
            (call: any[]) => call[1]?.headers?.Authorization,
        )
        expect(enviados).toEqual(["Bearer refresh-1", "Bearer refresh-2"])
    })
})
