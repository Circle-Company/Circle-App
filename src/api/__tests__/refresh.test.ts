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
        delete: (k: string) => void memory.delete(k),
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

vi.mock("@/contexts/Persisted/persist.account", () => ({
    useAccountStore: {
        getState: () => ({ set: vi.fn(), jwtToken: "", refreshToken: "", jwtExpiration: "" }),
    },
}))

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
function unauthorized(url = "/account") {
    return {
        config: { url, headers: {} },
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

        expect(instanceGet).toHaveBeenCalledWith("/auth/refresh-token", {
            headers: { Authorization: "Bearer refresh-bom" },
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

        release({ status: 200, data: { token: "token-novo", expiresIn: 3600 } })
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
})
