import { beforeEach, describe, expect, it, vi } from "vitest"

import { createMemoryMMKV, type MemoryMMKV } from "@/tests/memoryMMKV"

// `src/test-setup.ts` mocka `@/store` com uma forma desatualizada (sem `baseKey`, sem
// `safeSet`). Aqui o storage precisa ser o de verdade, sobre um MMKV em memória.
vi.unmock("@/store")

/**
 * A fusão de `persist.account` + `persist.user` (§11.2). O que estes testes travam não é
 * a mecânica do zustand — é o que a fusão passou a garantir e antes não garantia: um
 * `clear()` que limpa memória **e** storage, tetos nas coleções que hoje crescem para
 * sempre, e o guard que impede o dado de um usuário ser carregado sob a sessão de outro.
 */

// Literais de propósito: se uma chave mudar, o teste falha em vez de acompanhar (§2.2).
const KEYS = {
    blob: "@circle:account",
    liked: "@circle:account:liked",
    hidden: "@circle:account:hidden",
    readNotifications: "@circle:account:read-notifications",
    moments: "@circle:account:moments",
}

let mmkv: MemoryMMKV
let mod: typeof import("../account")

/** Carga nova do store sobre um MMKV semeado. */
async function load(seed: Record<string, string> = {}) {
    mmkv = createMemoryMMKV(seed)
    vi.resetModules()
    vi.doMock("react-native-mmkv", () => ({ createMMKV: () => mmkv }))
    mod = await import("../account")
}

const account = () => mod.useAccountStore.getState()

const ids = (count: number, prefix = "id") =>
    Array.from({ length: count }, (_, index) => `${prefix}-${index}`)

const moments = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
        id: `m-${index}`,
        description: null,
        video: { url: `https://cdn/${index}.mp4` },
        thumbnail: { url: `https://cdn/${index}.jpg`, width: 1, height: 1 },
        publishedAt: "2026-01-01T00:00:00.000Z",
    }))

const blob = (overrides: Record<string, unknown> = {}) =>
    JSON.stringify({
        schemaVersion: 1,
        userId: "user-a",
        profile: {
            username: "fulano",
            name: "Fulano",
            profilePicture: "https://cdn/fulano.jpg",
        },
        status: {
            accessLevel: "USER",
            verified: true,
            active: true,
            blocked: false,
            deleted: false,
        },
        terms: { agreed: true, version: "1.2", agreedAt: "2026-01-01T00:00:00.000Z" },
        coordinates: { latitude: -23.5, longitude: -46.6, syncedAt: "2026-01-01T00:00:00.000Z" },
        ...overrides,
    })

beforeEach(async () => {
    await load()
})

describe("chaves e forma do store", () => {
    it("declara uma chave por unidade de escrita, como no mapa do §2.2", () => {
        expect(mod.ACCOUNT_KEYS).toEqual(KEYS)
    })

    it("não guarda nenhum campo de token — eles saíram para src/session", () => {
        const fields = Object.keys(account())

        expect(fields).not.toContain("jwtToken")
        expect(fields).not.toContain("jwtExpiration")
        expect(fields).not.toContain("refreshToken")
    })

    it("nasce vazio: ler o storage é responsabilidade explícita do hydrate", async () => {
        await load({ [KEYS.blob]: blob(), [KEYS.liked]: JSON.stringify(["a"]) })

        // O parse das coleções não pode acontecer no import do módulo — é exatamente o
        // que hoje põe centenas de KB de JSON no caminho crítico do cold start.
        expect(account().username).toBe("")
        expect(account().likedMoments).toEqual([])
    })
})

describe("hydrate", () => {
    it("carrega perfil, status, termos e coordenadas do blob", async () => {
        await load({ [KEYS.blob]: blob() })

        account().hydrate()

        expect(account()).toMatchObject({
            userId: "user-a",
            username: "fulano",
            name: "Fulano",
            profilePicture: "https://cdn/fulano.jpg",
            accessLevel: "USER",
            isVerified: true,
            isActive: true,
            blocked: false,
            deleted: false,
            terms: { agreed: true, version: "1.2", agreedAt: "2026-01-01T00:00:00.000Z" },
            coordinates: { latitude: -23.5, longitude: -46.6 },
        })
    })

    it("carrega cada coleção da sua própria chave", async () => {
        await load({
            [KEYS.blob]: blob(),
            [KEYS.liked]: JSON.stringify(["l1", "l2"]),
            [KEYS.hidden]: JSON.stringify(["h1"]),
            [KEYS.readNotifications]: JSON.stringify(["n1", "n2", "n3"]),
            [KEYS.moments]: JSON.stringify(moments(2)),
        })

        account().hydrate()

        expect(account().likedMoments).toEqual(["l1", "l2"])
        expect(account().hiddenMoments).toEqual(["h1"])
        expect(account().readNotifications).toEqual(["n1", "n2", "n3"])
        expect(account().moments.map((m) => m.id)).toEqual(["m-0", "m-1"])
    })

    it("sobrevive a storage corrompido sem derrubar o cold start", async () => {
        await load({ [KEYS.blob]: "{ isto não é json", [KEYS.liked]: "]]" })

        expect(() => account().hydrate()).not.toThrow()
        expect(account().userId).toBe("")
        expect(account().likedMoments).toEqual([])
    })

    it("ignora um blob sem userId — sem ele não há de quem o dado é", async () => {
        await load({ [KEYS.blob]: blob({ userId: "" }) })

        account().hydrate()

        expect(account().username).toBe("")
    })

    it("dedupa e normaliza os ids que vieram do storage", async () => {
        await load({ [KEYS.liked]: JSON.stringify(["a", "a", 7, 7, null, "b"]) })

        account().hydrate()

        expect(account().likedMoments).toEqual(["a", "7", "b"])
    })
})

describe("guard de dado órfão (§2.6)", () => {
    it("descarta o blob cujo userId não é o esperado", async () => {
        await load({ [KEYS.blob]: blob({ userId: "user-a" }) })

        account().hydrate("user-b")

        expect(account().userId).toBe("")
        expect(account().username).toBe("")
    })

    it("apaga também as coleções órfãs: elas não têm âncora de identidade própria", async () => {
        await load({
            [KEYS.blob]: blob({ userId: "user-a" }),
            [KEYS.liked]: JSON.stringify(["do-usuario-a"]),
            [KEYS.readNotifications]: JSON.stringify(["n1"]),
        })

        account().hydrate("user-b")

        expect(account().likedMoments).toEqual([])
        expect(mmkv.data.has(KEYS.liked)).toBe(false)
        expect(mmkv.data.has(KEYS.readNotifications)).toBe(false)
        expect(mmkv.data.has(KEYS.blob)).toBe(false)
    })

    it("carrega normalmente quando o userId bate", async () => {
        await load({ [KEYS.blob]: blob({ userId: "user-a" }) })

        account().hydrate("user-a")

        expect(account().username).toBe("fulano")
    })

    it("sem userId esperado não há o que conferir, e o blob é carregado", async () => {
        await load({ [KEYS.blob]: blob({ userId: "user-a" }) })

        account().hydrate()

        expect(account().userId).toBe("user-a")
    })
})

describe("tetos das coleções (§2.5)", () => {
    it("liked para em 5.000 ids, descartando os mais antigos", async () => {
        await load({ [KEYS.liked]: JSON.stringify(ids(5_100)) })

        account().hydrate()

        expect(account().likedMoments).toHaveLength(5_000)
        expect(account().likedMoments[0]).toBe("id-100")
        expect(account().likedMoments.at(-1)).toBe("id-5099")
    })

    it("read-notifications para em 1.000 ids, descartando os mais antigos", async () => {
        await load({ [KEYS.readNotifications]: JSON.stringify(ids(1_400, "n")) })

        account().hydrate()

        expect(account().readNotifications).toHaveLength(1_000)
        expect(account().readNotifications[0]).toBe("n-400")
    })

    it("moments para em 200, descartando os mais antigos", async () => {
        await load({ [KEYS.moments]: JSON.stringify(moments(250)) })

        account().hydrate()

        expect(account().moments).toHaveLength(200)
        expect(account().moments[0].id).toBe("m-50")
    })

    it("hidden não tem teto: esconder é intenção explícita do usuário", async () => {
        await load({ [KEYS.hidden]: JSON.stringify(ids(6_000, "h")) })

        account().hydrate()

        expect(account().hiddenMoments).toHaveLength(6_000)
        expect(account().hiddenMoments[0]).toBe("h-0")
    })

    it("a hidratação cura o storage: a lista salva é reescrita já aparada", async () => {
        await load({ [KEYS.liked]: JSON.stringify(ids(5_100)) })

        account().hydrate()

        // Sem a reescrita, todo cold start reparsearia as 5.100 entradas para descartar
        // as mesmas 100 de novo.
        expect(JSON.parse(mmkv.data.get(KEYS.liked) as string)).toHaveLength(5_000)
    })

    it("o teto vale também para o que entra pela ação, não só pelo storage", async () => {
        await load({ [KEYS.liked]: JSON.stringify(ids(5_000)) })
        account().hydrate()

        account().addLikedMoment("id-novo")

        expect(account().likedMoments).toHaveLength(5_000)
        expect(account().likedMoments[0]).toBe("id-1")
        expect(account().likedMoments.at(-1)).toBe("id-novo")
    })

    it("addReadNotifications respeita o teto ao marcar um lote como lido", async () => {
        await load({ [KEYS.readNotifications]: JSON.stringify(ids(990, "n")) })
        account().hydrate()

        account().addReadNotifications(ids(30, "novo"))

        expect(account().readNotifications).toHaveLength(1_000)
        expect(account().readNotifications.at(-1)).toBe("novo-29")
    })
})

describe("ações de coleção", () => {
    it("addLikedMoment grava na chave de liked e em nenhuma outra", () => {
        account().addLikedMoment("m1")

        expect(JSON.parse(mmkv.data.get(KEYS.liked) as string)).toEqual(["m1"])
        expect(mmkv.data.has(KEYS.blob)).toBe(false)
    })

    it("addLikedMoment não duplica nem escreve de novo quando o id já está lá", () => {
        account().addLikedMoment("m1")
        const before = account().likedMoments

        account().addLikedMoment("m1")

        expect(account().likedMoments).toBe(before)
        expect(account().likedMoments).toEqual(["m1"])
    })

    it("removeLikedMoment tira do estado e do storage", () => {
        account().setLikedMoments(["a", "b"])

        account().removeLikedMoment("a")

        expect(account().likedMoments).toEqual(["b"])
        expect(JSON.parse(mmkv.data.get(KEYS.liked) as string)).toEqual(["b"])
    })

    it("setLikedMoments dedupa antes de gravar", () => {
        account().setLikedMoments(["a", "a", "b", "a"])

        expect(account().likedMoments).toEqual(["a", "b"])
    })

    it("addHiddenMoment e removeHiddenMoment persistem na chave de hidden", () => {
        account().addHiddenMoment("h1")
        account().addHiddenMoment("h1")
        account().addHiddenMoment("h2")
        account().removeHiddenMoment("h1")

        expect(account().hiddenMoments).toEqual(["h2"])
        expect(JSON.parse(mmkv.data.get(KEYS.hidden) as string)).toEqual(["h2"])
    })
})

describe("escrita do blob", () => {
    it("setIdentity, setStatus e setTerms reescrevem o mesmo blob", () => {
        account().setIdentity({
            userId: "user-a",
            username: "fulano",
            name: "Fulano",
            profilePicture: "https://cdn/f.jpg",
        })
        account().setStatus({
            accessLevel: "ADMIN",
            verified: true,
            active: true,
            blocked: false,
            deleted: false,
        })
        account().setTerms({ agreed: true, version: "2.0", agreedAt: "2026-02-02T00:00:00.000Z" })

        const saved = JSON.parse(mmkv.data.get(KEYS.blob) as string)

        expect(saved.userId).toBe("user-a")
        expect(saved.profile.username).toBe("fulano")
        expect(saved.status.accessLevel).toBe("ADMIN")
        expect(saved.terms.version).toBe("2.0")
    })

    it("o que foi gravado volta igual numa carga nova", async () => {
        account().setIdentity({
            userId: "user-a",
            username: "fulano",
            name: "Fulano",
            profilePicture: "https://cdn/f.jpg",
        })
        account().addLikedMoment("m1")

        // Mesmo MMKV, store novo: é o que acontece no cold start seguinte.
        const seed = Object.fromEntries(mmkv.data)
        await load(seed)
        account().hydrate("user-a")

        expect(account().username).toBe("fulano")
        expect(account().likedMoments).toEqual(["m1"])
    })

    it("setCoordinates carimba o momento da sincronização", () => {
        account().setCoordinates({ latitude: 1.5, longitude: -2.5 })

        expect(account().coordinates.latitude).toBe(1.5)
        expect(account().coordinates.syncedAt).toEqual(expect.any(String))
    })
})

describe("clear", () => {
    it("zera memória e storage na mesma operação", async () => {
        await load({
            [KEYS.blob]: blob(),
            [KEYS.liked]: JSON.stringify(["l1"]),
            [KEYS.hidden]: JSON.stringify(["h1"]),
            [KEYS.readNotifications]: JSON.stringify(["n1"]),
            [KEYS.moments]: JSON.stringify(moments(1)),
        })
        account().hydrate()

        account().clear()

        // O `remove()` do persist.account apagava `moments` do MMKV mas o omitia do `set`
        // final — o dado sumia do disco e sobrevivia na memória. As duas metades aqui.
        expect(account()).toMatchObject({
            userId: "",
            username: "",
            isVerified: false,
            accessLevel: "",
            moments: [],
            likedMoments: [],
            hiddenMoments: [],
            readNotifications: [],
            terms: { agreed: false, version: "", agreedAt: "" },
            coordinates: { latitude: 0, longitude: 0 },
        })
        expect(Object.values(KEYS).filter((key) => mmkv.data.has(key))).toEqual([])
    })
})
