import { beforeEach, describe, expect, it, vi } from "vitest"

import { createMemoryMMKV, type MemoryMMKV } from "@/tests/memoryMMKV"

vi.unmock("@/store")

let mmkv: MemoryMMKV
let login: typeof import("../login")
let runtime: typeof import("../runtime")

const TOKEN_KEY = "@circle:account:jwt:token"
const REFRESH_KEY = "@circle:account:jwt:refreshtoken"
const EXPIRATION_KEY = "@circle:account:jwt:expiration"
const SESSION_KEY = "@circle:session"

/** JWT de verdade só na forma: o app não valida assinatura, só lê o payload. */
function jwt(payload: Record<string, unknown>): string {
    const body = Buffer.from(JSON.stringify(payload))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")
    return `header.${body}.signature`
}

const ACCESS = jwt({ sub: "user-1", exp: 2000000000 })
const REFRESH = jwt({ sub: "user-1" })

async function load(seed: Record<string, string> = {}) {
    mmkv = createMemoryMMKV(seed)
    vi.resetModules()
    vi.doMock("react-native-mmkv", () => ({ createMMKV: () => mmkv }))
    login = await import("../login")
    runtime = await import("../runtime")
}

const payload = (overrides: Record<string, unknown> = {}) => ({
    token: ACCESS,
    refreshToken: REFRESH,
    user: { id: 42, username: "fulano", name: "Fulano", profilePicture: "https://x/y.jpg" },
    status: { accessLevel: "user", verified: true, blocked: false, deleted: false },
    ...overrides,
})

beforeEach(async () => {
    await load()
})

describe("persistLoginSession", () => {
    // A regressão que motivou o módulo: sem esta escrita o login autenticava no backend e
    // não deixava credencial nenhuma no disco.
    it("grava o par de tokens nas chaves que o interceptor lê", () => {
        const credentials = login.persistLoginSession(payload())

        expect(credentials).toEqual({ accessToken: ACCESS, refreshToken: REFRESH })
        expect(mmkv.getString(TOKEN_KEY)).toBe(ACCESS)
        expect(mmkv.getString(REFRESH_KEY)).toBe(REFRESH)
    })

    it("aceita o payload embrulhado em `session`", () => {
        expect(login.persistLoginSession({ session: payload() })).toMatchObject({
            accessToken: ACCESS,
        })
        expect(mmkv.getString(TOKEN_KEY)).toBe(ACCESS)
    })

    it("sem access token devolve null e não grava nada", () => {
        expect(login.persistLoginSession({ user: { id: 1 } })).toBeNull()
        expect(mmkv.getString(TOKEN_KEY)).toBeUndefined()
    })

    // Um refresh do login anterior pertence a outro par: mantê-lo é um token queimado.
    it("login sem refresh apaga o refresh anterior", async () => {
        await load({ [REFRESH_KEY]: "refresh-antigo" })

        login.persistLoginSession(payload({ refreshToken: undefined }))

        expect(mmkv.getString(REFRESH_KEY)).toBeUndefined()
    })

    it("a expiração sai do `exp` do próprio token", () => {
        login.persistLoginSession(payload())

        expect(mmkv.getString(EXPIRATION_KEY)).toBe(new Date(2000000000 * 1000).toISOString())
    })

    it("token sem `exp` não deixa expiração para trás", async () => {
        await load({ [EXPIRATION_KEY]: "2020-01-01T00:00:00.000Z" })

        login.persistLoginSession(payload({ token: jwt({ sub: "user-1" }) }))

        expect(mmkv.getString(EXPIRATION_KEY)).toBeUndefined()
    })

    // `recordLogin` e o Mixpanel leem o perfil dessas chaves.
    it("grava identidade, perfil e status", () => {
        login.persistLoginSession(payload())

        expect(mmkv.getString("@circle:user:id")).toBe("42")
        expect(mmkv.getString("@circle:user:username")).toBe("fulano")
        expect(mmkv.getString("@circle:user:name")).toBe("Fulano")
        expect(mmkv.getString("@circle:user:profilepicture")).toBe("https://x/y.jpg")
        expect(mmkv.getString("@circle:account:accesslevel")).toBe("user")
        expect(mmkv.getBoolean("@circle:account:verified")).toBe(true)
    })

    it("sem `user.id` no payload, o id vem do `sub` do token", () => {
        login.persistLoginSession(payload({ user: { username: "fulano" } }))

        expect(mmkv.getString("@circle:user:id")).toBe("user-1")
    })

    // O elo completo: é `recordLogin` que grava o blob, e ele lê justamente o que foi
    // escrito acima. Antes da correção ele não achava credencial e saía sem gravar.
    it("deixa `recordLogin` gravar o blob da sessão", () => {
        login.persistLoginSession(payload())
        runtime.recordLogin("apple-1")

        const blob = JSON.parse(mmkv.getString(SESSION_KEY) as string)
        expect(blob.state).toBe("active")
        expect(blob.identity).toMatchObject({ userId: "42", appleUserId: "apple-1" })
        expect(blob.credentials.accessToken).toBe(ACCESS)
        expect(blob.profile.username).toBe("fulano")
    })
})

describe("extractCredentials", () => {
    it.each([
        ["accessToken", { accessToken: ACCESS, refresh_token: REFRESH }],
        ["access_token", { access_token: ACCESS, refreshToken: REFRESH }],
    ])("aceita o par sob o nome alternativo %s", (_name, raw) => {
        expect(login.extractCredentials(raw)).toEqual({
            accessToken: ACCESS,
            refreshToken: REFRESH,
        })
    })

    it("aceita os tokens no nível de cima do envelope", () => {
        expect(
            login.extractCredentials({
                session: { user: {} },
                token: ACCESS,
                refreshToken: REFRESH,
            }),
        ).toEqual({ accessToken: ACCESS, refreshToken: REFRESH })
    })
})
