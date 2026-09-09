import { beforeEach, describe, expect, it, vi } from "vitest"

import { createMemoryMMKV, type MemoryMMKV } from "@/tests/memoryMMKV"

vi.unmock("@/store")

/**
 * O escopo declarado (§11.2). O que muda em relação ao
 * `clearSessionDataPreservingTutorial()` de hoje: a decisão deixa de ser "apaga tudo que
 * começa com @circle:, menos o tutorial" — uma exceção hardcoded que ninguém descobre sem
 * ler a função — e passa a sair de uma tabela onde cada prefixo diz a que vida pertence.
 */

let mmkv: MemoryMMKV
let scopes: typeof import("../scopes")
let account: typeof import("../account")

async function load(seed: Record<string, string> = {}) {
    mmkv = createMemoryMMKV(seed)
    vi.resetModules()
    vi.doMock("react-native-mmkv", () => ({ createMMKV: () => mmkv }))
    scopes = await import("../scopes")
    account = await import("../account")
}

const has = (key: string) => mmkv.data.has(key)

beforeEach(async () => {
    await load()
})

describe("resolveScope", () => {
    it("resolve pelo prefixo mais longo: o jwt é sessão dentro de uma chave de usuário", () => {
        expect(scopes.resolveScope("@circle:account:jwt:token")).toBe("session")
        expect(scopes.resolveScope("@circle:account:blocked")).toBe("user")
    })

    it("classifica o account e as métricas como do usuário", () => {
        expect(scopes.resolveScope("@circle:account")).toBe("user")
        expect(scopes.resolveScope("@circle:account:liked")).toBe("user")
        expect(scopes.resolveScope("@circle:metrics")).toBe("user")
        expect(scopes.resolveScope("@circle:statistics:totalFollowers")).toBe("user")
    })

    it("classifica preferências, tutorial e câmera como do aparelho", () => {
        expect(scopes.resolveScope("@circle:preferences:language:app")).toBe("device")
        expect(scopes.resolveScope("@circle:tutorial:dismissed")).toBe("device")
        expect(scopes.resolveScope("@circle:camera:position")).toBe("device")
        expect(scopes.resolveScope("@circle:device")).toBe("device")
    })

    it("trata a chave não declarada como do usuário — o lado seguro é apagar", () => {
        // Perder dado de aparelho é incômodo; vazar dado de uma conta para outra é
        // incidente. O esquecimento cai para o lado barato, e fica visível abaixo.
        expect(scopes.resolveScope("@circle:invencao:nova")).toBe("user")
        expect(scopes.isDeclared("@circle:invencao:nova")).toBe(false)
    })

    it("toda chave do account é de escopo user — as duas tabelas não podem divergir", () => {
        for (const key of Object.values(account.ACCOUNT_KEYS)) {
            expect(scopes.resolveScope(key)).toBe("user")
        }
    })
})

describe("clearUserScopedData", () => {
    const seed = {
        // usuário
        "@circle:account": '{"userId":"user-a"}',
        "@circle:account:liked": '["m1"]',
        "@circle:account:hidden": '["m2"]',
        "@circle:account:read-notifications": '["n1"]',
        "@circle:account:moments": "[]",
        "@circle:metrics": "{}",
        "@circle:statistics:totalFollowers": "10",
        "@circle:account:likedmoments": '["legado"]',
        "@circle:user:username": "fulano",
        "@circle:like:pressed:m1": "true",
        // aparelho
        "@circle:preferences:language:app": "pt",
        "@circle:tutorial:feed:step1Seen": "true",
        "@circle:tutorial:dismissed": "false",
        "@circle:camera:position": "front",
        "@circle:permissions:postnotifications": "true",
        "@circle:device": "{}",
        "@circle:clock-offset": "1200",
        "@circle:push-token": "token-de-push",
        // sessão
        "@circle:session": '{"state":"active"}',
        "@circle:account:jwt:token": "access",
        "@circle:account:jwt:refreshtoken": "refresh",
    }

    it("apaga tudo que é do usuário logado, inclusive as chaves legadas", async () => {
        await load(seed)

        scopes.clearUserScopedData()

        expect(has("@circle:account")).toBe(false)
        expect(has("@circle:account:liked")).toBe(false)
        expect(has("@circle:account:hidden")).toBe(false)
        expect(has("@circle:account:read-notifications")).toBe(false)
        expect(has("@circle:account:moments")).toBe(false)
        expect(has("@circle:metrics")).toBe(false)
        expect(has("@circle:statistics:totalFollowers")).toBe(false)
        expect(has("@circle:account:likedmoments")).toBe(false)
        expect(has("@circle:user:username")).toBe(false)
        expect(has("@circle:like:pressed:m1")).toBe(false)
    })

    it("preserva o que é do aparelho — não só o tutorial", async () => {
        await load(seed)

        scopes.clearUserScopedData()

        expect(mmkv.getString("@circle:preferences:language:app")).toBe("pt")
        expect(mmkv.getString("@circle:tutorial:feed:step1Seen")).toBe("true")
        expect(mmkv.getString("@circle:tutorial:dismissed")).toBe("false")
        expect(mmkv.getString("@circle:camera:position")).toBe("front")
        expect(mmkv.getString("@circle:permissions:postnotifications")).toBe("true")
        expect(mmkv.getString("@circle:device")).toBe("{}")
        expect(mmkv.getString("@circle:clock-offset")).toBe("1200")
        expect(mmkv.getString("@circle:push-token")).toBe("token-de-push")
    })

    it("não toca na sessão: quem a encerra é o SessionStore, numa escrita só", async () => {
        await load(seed)

        scopes.clearUserScopedData()

        // Apagar o blob aqui destruiria junto a identidade que o re-auth de um toque
        // (§5.8) usa para oferecer "entrar como @fulano".
        expect(mmkv.getString("@circle:session")).toBe('{"state":"active"}')
        expect(mmkv.getString("@circle:account:jwt:token")).toBe("access")
        expect(mmkv.getString("@circle:account:jwt:refreshtoken")).toBe("refresh")
    })

    it("ignora o que está fora do namespace do app", async () => {
        await load({ ...seed, "outra-lib:cache": "valor" })

        scopes.clearUserScopedData()

        // A instância padrão do MMKV é compartilhada: varrer o que não é nosso apagaria
        // dado de terceiros.
        expect(mmkv.getString("outra-lib:cache")).toBe("valor")
    })

    it("apaga a chave não declarada e a reporta, para a tabela não envelhecer calada", async () => {
        await load({ ...seed, "@circle:invencao:nova": "valor" })

        expect(scopes.findUndeclaredKeys()).toEqual(["@circle:invencao:nova"])

        scopes.clearUserScopedData()

        expect(has("@circle:invencao:nova")).toBe(false)
    })

    it("não quebra com o storage vazio", async () => {
        await load()

        expect(() => scopes.clearUserScopedData()).not.toThrow()
    })
})
