import { beforeEach, describe, expect, it, vi } from "vitest"

import { createMemoryMMKV, makeJwt, type MemoryMMKV } from "@/tests/memoryMMKV"

// O storage real é o objeto sob teste.
vi.unmock("@/store")

let mmkv: MemoryMMKV
let mod: typeof import("../storage")

async function load(seed: Record<string, string> = {}) {
    mmkv = createMemoryMMKV(seed)
    vi.resetModules()
    vi.doMock("react-native-mmkv", () => ({ createMMKV: () => mmkv }))
    mod = await import("../storage")
}

const SESSION_KEY = "@circle:session"
const LEGACY = {
    accessToken: "@circle:account:jwt:token",
    refreshToken: "@circle:account:jwt:refreshtoken",
    userId: "@circle:user:id",
    username: "@circle:user:username",
    name: "@circle:user:name",
    profilePicture: "@circle:user:profilepicture",
    accessLevel: "@circle:account:accesslevel",
    verified: "@circle:account:verified",
}

const readStoredSession = () => JSON.parse(mmkv.data.get(SESSION_KEY) as string)

beforeEach(async () => {
    await load()
})

describe("readSession — storage vazio", () => {
    it("devolve empty quando não há nem blob nem chaves antigas", async () => {
        expect(mod.readSession()).toEqual({ schemaVersion: 1, state: "empty" })
    })

    it("não grava nada quando não há o que migrar", async () => {
        mod.readSession()

        expect(mmkv.data.has(SESSION_KEY)).toBe(false)
    })
})

describe("migração das chaves legadas", () => {
    it("monta uma sessão ativa a partir das chaves soltas e grava o blob", async () => {
        await load({
            [LEGACY.accessToken]: "access-antigo",
            [LEGACY.refreshToken]: "refresh-antigo",
            [LEGACY.userId]: "user-7",
            [LEGACY.username]: "fulano",
            [LEGACY.name]: "Fulano",
            [LEGACY.profilePicture]: "https://cdn/f.jpg",
            [LEGACY.accessLevel]: "USER",
            [LEGACY.verified]: "true",
        })

        const session = mod.readSession()

        expect(session).toMatchObject({
            state: "active",
            identity: { userId: "user-7" },
            credentials: { accessToken: "access-antigo", refreshToken: "refresh-antigo" },
            profile: { username: "fulano", name: "Fulano" },
            status: { accessLevel: "USER", verified: true },
        })
        expect(readStoredSession()).toMatchObject({ state: "active" })
    })

    it("a geração começa em zero", async () => {
        await load({
            [LEGACY.accessToken]: "a",
            [LEGACY.refreshToken]: "r",
            [LEGACY.userId]: "user-7",
        })

        expect(mod.readSession()).toMatchObject({ credentials: { generation: 0 } })
    })

    it("conta migrada não tem appleUserId — o campo é preenchido no login seguinte", async () => {
        await load({
            [LEGACY.accessToken]: "a",
            [LEGACY.refreshToken]: "r",
            [LEGACY.userId]: "user-7",
        })

        const session = mod.readSession()

        expect(session).toMatchObject({ identity: { userId: "user-7" } })
        expect((session as any).identity.appleUserId).toBeUndefined()
    })

    it("usa o sub do JWT quando o userId não está no storage", async () => {
        await load({
            [LEGACY.accessToken]: makeJwt({ sub: "user-do-token", exp: 999 }),
            [LEGACY.refreshToken]: "r",
        })

        expect(mod.readSession()).toMatchObject({ identity: { userId: "user-do-token" } })
    })

    it("sem par completo de tokens, preserva a identidade como signed-out", async () => {
        await load({ [LEGACY.userId]: "user-7", [LEGACY.username]: "fulano" })

        expect(mod.readSession()).toMatchObject({
            state: "signed-out",
            identity: { userId: "user-7" },
            profile: { username: "fulano" },
        })
    })

    it("sem identidade nenhuma, cai em empty", async () => {
        await load({ [LEGACY.accessToken]: "sem-sub", [LEGACY.refreshToken]: "r" })

        expect(mod.readSession()).toEqual({ schemaVersion: 1, state: "empty" })
    })

    // Rollback para uma build anterior precisa continuar possível.
    it("não apaga as chaves antigas", async () => {
        await load({
            [LEGACY.accessToken]: "a",
            [LEGACY.refreshToken]: "r",
            [LEGACY.userId]: "user-7",
        })

        mod.readSession()

        expect(mmkv.data.get(LEGACY.accessToken)).toBe("a")
        expect(mmkv.data.get(LEGACY.refreshToken)).toBe("r")
    })

    // Se rodasse de novo por cima de um blob existente, um logout seria desfeito pelas
    // chaves antigas que ainda estão lá.
    it("não roda quando já existe blob — o blob é a autoridade", async () => {
        await load({
            [SESSION_KEY]: JSON.stringify({
                schemaVersion: 1,
                state: "signed-out",
                identity: { userId: "user-7" },
                profile: { username: "fulano" },
                signedOutAt: "2026-01-01T00:00:00.000Z",
            }),
            [LEGACY.accessToken]: "token-zumbi",
            [LEGACY.refreshToken]: "refresh-zumbi",
            [LEGACY.userId]: "user-7",
        })

        expect(mod.readSession()).toMatchObject({ state: "signed-out" })
    })
})

describe("readSession — blob existente", () => {
    const active = {
        schemaVersion: 1,
        state: "active",
        identity: { userId: "user-1", appleUserId: "apple-1" },
        credentials: {
            accessToken: "a",
            refreshToken: "r",
            generation: 2,
            issuedAt: "2026-01-01T00:00:00.000Z",
        },
        profile: { username: "fulano" },
        status: { accessLevel: "USER", verified: false, blocked: false, deleted: false },
        meta: { signedInAt: "2026-01-01T00:00:00.000Z" },
    }

    it("lê de volta exatamente o que foi gravado", async () => {
        await load({ [SESSION_KEY]: JSON.stringify(active) })

        expect(mod.readSession()).toEqual(active)
    })

    it("JSON corrompido vira empty em vez de lançar", async () => {
        await load({ [SESSION_KEY]: "{ isto não é json" })

        expect(mod.readSession()).toEqual({ schemaVersion: 1, state: "empty" })
    })

    it("blob válido mas sem userId vira empty", async () => {
        await load({
            [SESSION_KEY]: JSON.stringify({ ...active, identity: { appleUserId: "apple-1" } }),
        })

        expect(mod.readSession()).toEqual({ schemaVersion: 1, state: "empty" })
    })

    // Degradar para o estado adjacente, não para o pior estado.
    it("credenciais corrompidas degradam para signed-out, preservando a identidade", async () => {
        await load({
            [SESSION_KEY]: JSON.stringify({ ...active, credentials: { accessToken: "só-metade" } }),
        })

        expect(mod.readSession()).toMatchObject({
            state: "signed-out",
            identity: { userId: "user-1", appleUserId: "apple-1" },
        })
    })

    it("blob de versão futura degrada para signed-out em vez de apagar a identidade", async () => {
        await load({
            [SESSION_KEY]: JSON.stringify({
                ...active,
                schemaVersion: 99,
                state: "formato-do-futuro",
            }),
        })

        expect(mod.readSession()).toMatchObject({
            state: "signed-out",
            identity: { userId: "user-1" },
        })
    })
})

describe("writeSession / clearSession", () => {
    it("grava o estado como uma única chave", async () => {
        mod.writeSession({
            schemaVersion: 1,
            state: "signed-out",
            identity: { userId: "user-1" },
            profile: { username: "fulano" },
            signedOutAt: "2026-01-01T00:00:00.000Z",
        })

        const written = Array.from(mmkv.data.keys())
        expect(written).toEqual([SESSION_KEY])
        expect(readStoredSession()).toMatchObject({ state: "signed-out" })
    })

    it("o que vai ao storage é o estado sem transformação — ida e volta é idempotente", async () => {
        const session = mod.readSession()
        mod.writeSession(session)

        expect(mod.readSession()).toEqual(session)
    })

    it("clearSession leva a empty", async () => {
        mod.clearSession()

        expect(mod.readSession()).toEqual({ schemaVersion: 1, state: "empty" })
    })
})
