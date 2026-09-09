import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createMemoryMMKV, makeJwt, type MemoryMMKV } from "@/tests/memoryMMKV"

// Precisamos do `src/store` real: o offset de relógio é lido e gravado no MMKV.
vi.unmock("@/store")

let mmkv: MemoryMMKV
let jwt: typeof import("../jwt")

async function load(seed: Record<string, string> = {}) {
    mmkv = createMemoryMMKV(seed)
    vi.resetModules()
    vi.doMock("react-native-mmkv", () => ({ createMMKV: () => mmkv }))
    jwt = await import("../jwt")
}

const CLOCK_OFFSET_KEY = "@circle:clockoffset"

beforeEach(async () => {
    vi.useRealTimers()
    await load()
})

afterEach(() => {
    vi.useRealTimers()
})

describe("decodeJwtPayload", () => {
    it("lê o payload de um JWT bem formado", async () => {
        const token = makeJwt({ sub: "user-42", exp: 1_700_000_000 })

        expect(jwt.decodeJwtPayload(token)).toMatchObject({ sub: "user-42", exp: 1_700_000_000 })
    })

    it("decodifica base64url (com - e _) sem depender de atob", async () => {
        // `??~` em bytes gera "+" e "/" em base64 padrão, que viram "-" e "_" em base64url.
        const token = makeJwt({ sub: "??~", exp: 1 })

        expect(jwt.decodeJwtPayload(token)).toMatchObject({ sub: "??~" })
    })

    it("devolve null para token sem as três partes, vazio ou indefinido", async () => {
        expect(jwt.decodeJwtPayload("a.b")).toBeNull()
        expect(jwt.decodeJwtPayload("")).toBeNull()
        expect(jwt.decodeJwtPayload(undefined)).toBeNull()
    })

    it("devolve null quando o payload não é JSON válido", async () => {
        expect(jwt.decodeJwtPayload("header.bm90LWpzb24.sig")).toBeNull()
    })
})

describe("decodeExp / decodeSub", () => {
    it("extrai exp numérico e sub string", async () => {
        const token = makeJwt({ sub: "abc", exp: 123 })

        expect(jwt.decodeExp(token)).toBe(123)
        expect(jwt.decodeSub(token)).toBe("abc")
    })

    it("ignora exp não numérico e converte sub numérico", async () => {
        expect(jwt.decodeExp(makeJwt({ exp: "amanhã" }))).toBeNull()
        expect(jwt.decodeSub(makeJwt({ sub: 42 }))).toBe("42")
    })

    it("devolve null quando os campos não existem", async () => {
        const token = makeJwt({ foo: "bar" })

        expect(jwt.decodeExp(token)).toBeNull()
        expect(jwt.decodeSub(token)).toBeNull()
    })
})

describe("isAccessTokenExpired", () => {
    const inSeconds = (ms: number) => Math.floor(ms / 1000)

    it("token bem no futuro não está expirado", async () => {
        const token = makeJwt({ exp: inSeconds(Date.now()) + 3600 })

        expect(jwt.isAccessTokenExpired(token)).toBe(false)
    })

    it("token já vencido está expirado", async () => {
        const token = makeJwt({ exp: inSeconds(Date.now()) - 10 })

        expect(jwt.isAccessTokenExpired(token)).toBe(true)
    })

    // A margem existe para o token que morreria durante o voo da request.
    it("token que vence dentro da margem de skew conta como expirado", async () => {
        const token = makeJwt({ exp: inSeconds(Date.now()) + 10 })

        expect(jwt.isAccessTokenExpired(token)).toBe(true)
        expect(jwt.isAccessTokenExpired(token, 0)).toBe(false)
    })

    it("token sem exp, ilegível ou ausente conta como expirado", async () => {
        expect(jwt.isAccessTokenExpired(makeJwt({ sub: "x" }))).toBe(true)
        expect(jwt.isAccessTokenExpired("nao-e-um-jwt")).toBe(true)
        expect(jwt.isAccessTokenExpired(undefined)).toBe(true)
    })

    // Trava o motivo do nome: o refresh token do backend é emitido SEM `exp`, então esta
    // função o consideraria expirado sempre. Aplicá-la ao refresh token declararia morta
    // uma sessão viva. Quem decide se o refresh ainda serve é o banco, não o cliente.
    it("um refresh token (sem exp) seria dado como expirado — por isso o nome é AccessToken", async () => {
        const refreshTokenSemExp = makeJwt({ sub: "user-1" })

        expect(jwt.decodeExp(refreshTokenSemExp)).toBeNull()
        expect(jwt.isAccessTokenExpired(refreshTokenSemExp)).toBe(true)
    })
})

describe("correção de relógio", () => {
    it("sem offset gravado, now() é o relógio local", async () => {
        expect(jwt.getClockOffsetMs()).toBe(0)
        expect(Math.abs(jwt.now() - Date.now())).toBeLessThan(50)
    })

    it("grava o offset a partir do header Date do servidor", async () => {
        const serverTime = new Date(Date.now() + 10 * 60_000)

        jwt.recordServerTime(serverTime.toUTCString())

        expect(jwt.getClockOffsetMs()).toBeGreaterThan(9 * 60_000)
        expect(mmkv.data.has(CLOCK_OFFSET_KEY)).toBe(true)
    })

    it("não reescreve por diferenças pequenas", async () => {
        jwt.recordServerTime(new Date(Date.now() + 1_000).toUTCString())

        expect(mmkv.data.has(CLOCK_OFFSET_KEY)).toBe(false)
    })

    it("ignora header ausente ou ilegível", async () => {
        jwt.recordServerTime(undefined)
        jwt.recordServerTime("nem-parece-uma-data")

        expect(mmkv.data.has(CLOCK_OFFSET_KEY)).toBe(false)
    })

    // O ponto da correção: relógio local adiantado não pode deslogar sessão válida.
    it("um relógio local adiantado não expira um token que o servidor considera vivo", async () => {
        const serverNow = Date.now()
        const token = makeJwt({ exp: Math.floor(serverNow / 1000) + 600 }) // vence em 10 min

        // device 30 min adiantado em relação ao servidor
        await load({ [CLOCK_OFFSET_KEY]: String(-30 * 60_000) })
        expect(jwt.isAccessTokenExpired(token)).toBe(false)

        // sem a correção, o mesmo token pareceria vencido
        await load()
        vi.setSystemTime(new Date(serverNow + 30 * 60_000))
        expect(jwt.isAccessTokenExpired(token)).toBe(true)
    })
})
