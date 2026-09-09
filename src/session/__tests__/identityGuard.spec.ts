import { beforeEach, describe, expect, it, vi } from "vitest"

import { createMemoryMMKV, type MemoryMMKV } from "@/tests/memoryMMKV"

vi.unmock("@/store")

let mmkv: MemoryMMKV
let guard: typeof import("../identityGuard")

const SESSION_KEY = "@circle:session"

async function load(seed: Record<string, string> = {}) {
    mmkv = createMemoryMMKV(seed)
    vi.resetModules()
    vi.doMock("react-native-mmkv", () => ({ createMMKV: () => mmkv }))
    guard = await import("../identityGuard")
}

const signedOut = (identity: Record<string, string>) =>
    JSON.stringify({
        schemaVersion: 1,
        state: "signed-out",
        identity,
        profile: { username: "fulano" },
        signedOutAt: "2026-01-01T00:00:00.000Z",
    })

beforeEach(async () => {
    await load()
})

describe("decideIdentityChange", () => {
    it("sem sessão anterior, não há resíduo de ninguém", async () => {
        const decision = guard.decideIdentityChange({ appleUserId: "apple-1" })

        expect(decision).toEqual({ isDifferentPerson: false, reason: "no-previous-session" })
    })

    it("mesmo Apple ID é a mesma pessoa", async () => {
        await load({ [SESSION_KEY]: signedOut({ userId: "user-1", appleUserId: "apple-1" }) })

        expect(guard.decideIdentityChange({ appleUserId: "apple-1" })).toMatchObject({
            isDifferentPerson: false,
        })
    })

    // O cenário que motiva o módulo: outro Apple ID no mesmo aparelho.
    it("Apple ID diferente é outra pessoa", async () => {
        await load({ [SESSION_KEY]: signedOut({ userId: "user-1", appleUserId: "apple-1" }) })

        expect(guard.decideIdentityChange({ appleUserId: "apple-2" })).toEqual({
            isDifferentPerson: true,
            reason: "apple-id-changed",
        })
    })

    it("o Apple ID tem prioridade sobre o userId", async () => {
        await load({ [SESSION_KEY]: signedOut({ userId: "user-1", appleUserId: "apple-1" }) })

        // mesmo Apple ID, userId diferente (rotação de id no backend): mesma pessoa
        expect(
            guard.decideIdentityChange({ appleUserId: "apple-1", userId: "user-9" }),
        ).toMatchObject({ isDifferentPerson: false })
    })

    it("cai no userId quando falta a âncora do Apple", async () => {
        await load({ [SESSION_KEY]: signedOut({ userId: "user-1" }) })

        expect(guard.decideIdentityChange({ userId: "user-2" })).toEqual({
            isDifferentPerson: true,
            reason: "user-id-changed",
        })
        expect(guard.decideIdentityChange({ userId: "user-1" })).toMatchObject({
            isDifferentPerson: false,
        })
    })

    // Perder dado de quem só atualizou o app é dano garantido; o vazamento é possibilidade,
    // e a entrada seguinte — já com a âncora gravada — decide corretamente.
    it("sem nada comparável dos dois lados, falha para o lado de NÃO apagar", async () => {
        await load({ [SESSION_KEY]: signedOut({ userId: "user-1" }) })

        expect(guard.decideIdentityChange({ appleUserId: "apple-1" })).toMatchObject({
            isDifferentPerson: false,
        })
    })
})

describe("clearResidualDataIfDifferentPerson", () => {
    const userScoped = {
        "@circle:viewer": '{"userId":"user-1"}',
        "@circle:viewer:liked": '["m1"]',
        "@circle:metrics": "{}",
        "@circle:user:username": "fulano",
    }
    const deviceScoped = {
        "@circle:tutorial:feed:step1Seen": "true",
        "@circle:preferences:language:app": "pt",
        "@circle:permissions:postnotifications": "true",
    }

    it("apaga o dado do usuário anterior e preserva o do aparelho", async () => {
        await load({
            [SESSION_KEY]: signedOut({ userId: "user-1", appleUserId: "apple-1" }),
            ...userScoped,
            ...deviceScoped,
        })

        const decision = guard.clearResidualDataIfDifferentPerson({ appleUserId: "apple-2" })

        expect(decision.isDifferentPerson).toBe(true)
        for (const key of Object.keys(userScoped)) {
            expect(mmkv.getString(key)).toBeUndefined()
        }
        for (const [key, value] of Object.entries(deviceScoped)) {
            expect(mmkv.getString(key)).toBe(value)
        }
    })

    it("não apaga nada quando é a mesma pessoa", async () => {
        await load({
            [SESSION_KEY]: signedOut({ userId: "user-1", appleUserId: "apple-1" }),
            ...userScoped,
        })

        guard.clearResidualDataIfDifferentPerson({ appleUserId: "apple-1" })

        expect(mmkv.getString("@circle:viewer:liked")).toBe('["m1"]')
    })

    it("primeiro login do aparelho não apaga nada", async () => {
        await load({ ...deviceScoped })

        const decision = guard.clearResidualDataIfDifferentPerson({ appleUserId: "apple-1" })

        expect(decision.isDifferentPerson).toBe(false)
        expect(mmkv.getString("@circle:tutorial:feed:step1Seen")).toBe("true")
    })
})
