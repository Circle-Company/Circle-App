import { beforeEach, describe, expect, it, vi } from "vitest"

import { createMemoryMMKV, type MemoryMMKV } from "@/tests/memoryMMKV"

// A ponte lê e escreve o storage real.
vi.unmock("@/store")

let mmkv: MemoryMMKV
let runtime: typeof import("../runtime")

const KEYS = {
    accessToken: "@circle:account:jwt:token",
    refreshToken: "@circle:account:jwt:refreshtoken",
    userId: "@circle:user:id",
    username: "@circle:user:username",
    session: "@circle:session",
}

async function load(seed: Record<string, string> = {}) {
    mmkv = createMemoryMMKV(seed)
    vi.resetModules()
    vi.doMock("react-native-mmkv", () => ({ createMMKV: () => mmkv }))
    runtime = await import("../runtime")
}

const okResponse = (n: number) => ({
    token: `access-${n}`,
    refreshToken: `refresh-${n}`,
    expiresIn: 36_000,
})

const loggedIn = (n = 1) => ({
    [KEYS.accessToken]: `access-${n}`,
    [KEYS.refreshToken]: `refresh-${n}`,
    [KEYS.userId]: "user-1",
    [KEYS.username]: "fulano",
})

beforeEach(async () => {
    await load(loggedIn())
})

describe("ensureSession", () => {
    it("constrói a sessão a partir das chaves legadas", async () => {
        const session = runtime.ensureSession(async () => okResponse(2))

        expect(session).not.toBeNull()
        expect(session!.identity.userId).toBe("user-1")
        expect(session!.credentials.refreshToken).toBe("refresh-1")
    })

    it("devolve null sem credenciais em storage", async () => {
        await load({})

        expect(runtime.ensureSession(async () => okResponse(1))).toBeNull()
    })

    // É o que garante o single-flight entre dois 401 simultâneos: se cada um construísse
    // a sua Session, seriam duas rotações do mesmo token — e a conta seria revogada.
    it("reaproveita a instância enquanto o refresh token não muda", async () => {
        const first = runtime.ensureSession(async () => okResponse(2))
        const second = runtime.ensureSession(async () => okResponse(2))

        expect(second).toBe(first)
    })

    // O risco da coexistência: o login ainda escreve direto nas chaves legadas, então a
    // sessão em memória precisa perceber que as credenciais foram trocadas por fora.
    it("descarta e reconstrói quando o refresh token muda por fora (login novo)", async () => {
        const first = runtime.ensureSession(async () => okResponse(2))

        mmkv.set(KEYS.accessToken, "access-do-login-novo")
        mmkv.set(KEYS.refreshToken, "refresh-do-login-novo")

        const second = runtime.ensureSession(async () => okResponse(2))

        expect(second).not.toBe(first)
        expect(second!.credentials.refreshToken).toBe("refresh-do-login-novo")
        // a instância antiga fica inutilizável: não pode consumir token nenhum
        expect(first!.isDestroyed).toBe(true)
    })

    it("uma sessão descartada por troca de credenciais não consegue mais refrescar", async () => {
        const first = runtime.ensureSession(async () => okResponse(2))
        mmkv.set(KEYS.refreshToken, "refresh-do-login-novo")
        runtime.ensureSession(async () => okResponse(2))

        await expect(first!.refresh()).rejects.toThrow(/descartada/i)
    })
})

describe("espelhamento no storage legado", () => {
    it("uma rotação bem-sucedida grava o par novo nas chaves antigas", async () => {
        const session = runtime.ensureSession(async () => okResponse(2))

        await session!.refresh()

        expect(mmkv.getString(KEYS.accessToken)).toBe("access-2")
        expect(mmkv.getString(KEYS.refreshToken)).toBe("refresh-2")
    })

    it("a rotação também atualiza o blob novo, que fica pronto para a Fase 3", async () => {
        const session = runtime.ensureSession(async () => okResponse(2))

        await session!.refresh()

        const blob = JSON.parse(mmkv.getString(KEYS.session) as string)
        expect(blob).toMatchObject({
            state: "active",
            identity: { userId: "user-1" },
            credentials: { accessToken: "access-2", refreshToken: "refresh-2" },
        })
    })

    // Preservar os tokens é a diferença entre "tenta de novo daqui a pouco" e "o usuário
    // foi deslogado porque o wifi caiu".
    it("falha transitória preserva as credenciais nos dois storages", async () => {
        const session = runtime.ensureSession(async () => {
            throw Object.assign(new Error("500"), { response: { status: 500 } })
        })

        await expect(session!.refresh()).rejects.toThrow()

        expect(mmkv.getString(KEYS.accessToken)).toBe("access-1")
        expect(mmkv.getString(KEYS.refreshToken)).toBe("refresh-1")

        const blob = JSON.parse(mmkv.getString(KEYS.session) as string)
        expect(blob).toMatchObject({
            state: "active",
            credentials: { refreshToken: "refresh-1" },
        })
    })

    it("falha terminal limpa as chaves legadas e avisa o handler", async () => {
        const onExpired = vi.fn()
        runtime.setExpiredHandler(onExpired)

        const session = runtime.ensureSession(async () => {
            throw Object.assign(new Error("401"), { response: { status: 401 } })
        })
        await expect(session!.refresh()).rejects.toThrow()

        expect(mmkv.getString(KEYS.accessToken)).toBeUndefined()
        expect(mmkv.getString(KEYS.refreshToken)).toBeUndefined()
        expect(onExpired).toHaveBeenCalledTimes(1)
    })

    it("o blob guarda signed-out após o terminal, preservando a identidade", async () => {
        const session = runtime.ensureSession(async () => {
            throw Object.assign(new Error("401"), { response: { status: 401 } })
        })
        await expect(session!.refresh()).rejects.toThrow()

        const blob = JSON.parse(mmkv.getString(KEYS.session) as string)
        expect(blob).toMatchObject({ state: "signed-out", identity: { userId: "user-1" } })
    })
})

describe("continuidade da geração", () => {
    it("cresce entre rotações da mesma sessão", async () => {
        let n = 1
        const session = runtime.ensureSession(async () => okResponse(++n))

        await session!.refresh()
        expect(session!.generation).toBe(1)

        await session!.refresh()
        expect(session!.generation).toBe(2)
    })

    // A geração serve para comparar requests em voo; ela não é identidade, então recomeçar
    // do zero num login novo é correto e evita herdar contagem de outra sessão.
    it("recomeça do zero quando as credenciais vêm de um login novo", async () => {
        const first = runtime.ensureSession(async () => okResponse(2))
        await first!.refresh()
        expect(first!.generation).toBe(1)

        mmkv.set(KEYS.refreshToken, "refresh-de-outro-login")
        const second = runtime.ensureSession(async () => okResponse(9))

        expect(second!.generation).toBe(0)
    })
})

describe("barreira de revalidação", () => {
    it("sem barreira instalada, a espera resolve na hora", async () => {
        await expect(runtime.waitForRevalidation()).resolves.toBeUndefined()
    })

    it("com barreira instalada, delega a espera para ela", async () => {
        const wait = vi.fn(async () => {})
        runtime.setBarrier({ wait })

        await runtime.waitForRevalidation()

        expect(wait).toHaveBeenCalledTimes(1)
    })

    it("desinstalar volta a resolver na hora", async () => {
        runtime.setBarrier({ wait: vi.fn(async () => {}) })
        runtime.setBarrier(null)

        await expect(runtime.waitForRevalidation()).resolves.toBeUndefined()
    })
})

describe("refreshCurrentSession", () => {
    // O refresh proativo pode disparar logo depois de um logout: sem sessão, não há o que
    // rotacionar, e lançar aqui viraria unhandled rejection num callback de timer.
    it("não faz nada quando não há sessão viva", async () => {
        await load({})

        await expect(runtime.refreshCurrentSession()).resolves.toBeUndefined()
    })

    it("usa o single-flight da sessão viva", async () => {
        const request = vi.fn(async () => okResponse(2))
        runtime.ensureSession(request)

        await Promise.all([runtime.refreshCurrentSession(), runtime.refreshCurrentSession()])

        expect(request).toHaveBeenCalledTimes(1)
    })
})

describe("recordLogin — a âncora do Apple", () => {
    // Sem isto o appleUserId nunca chega ao disco, e o guard do §2.6 fica sem com o que
    // comparar no login seguinte.
    it("grava o appleUserId no blob da sessão", async () => {
        runtime.recordLogin("apple-1")

        const blob = JSON.parse(mmkv.getString(KEYS.session) as string)
        expect(blob).toMatchObject({
            state: "active",
            identity: { userId: "user-1", appleUserId: "apple-1" },
        })
    })

    it("sem appleUserId, grava a sessão mesmo assim (conta migrada)", async () => {
        runtime.recordLogin()

        const blob = JSON.parse(mmkv.getString(KEYS.session) as string)
        expect(blob).toMatchObject({ state: "active", identity: { userId: "user-1" } })
        expect(blob.identity.appleUserId).toBeUndefined()
    })

    it("não grava nada quando o login não deixou credenciais", async () => {
        await load({})

        runtime.recordLogin("apple-1")

        expect(mmkv.getString(KEYS.session)).toBeUndefined()
    })

    // Uma sessão de antes do login descreve credenciais que já não são as correntes.
    it("mata a sessão anterior para ela não rotacionar um token superado", async () => {
        const anterior = runtime.ensureSession(async () => okResponse(2))

        runtime.recordLogin("apple-1")

        expect(anterior!.isDestroyed).toBe(true)
    })
})
