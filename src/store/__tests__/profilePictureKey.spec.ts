import { describe, expect, it, vi } from "vitest"

// `src/test-setup.ts` mocka `@/store` para o resto da suíte. Aqui o alvo é o módulo de
// verdade — inclusive a migração que roda no import dele.
vi.unmock("@/store")

/**
 * A chave da foto de perfil ficou por muito tempo sem o prefixo `@circle:`, o que a
 * tornava invisível para as varreduras de limpeza — a foto do usuário anterior
 * sobrevivia ao logout. Estes testes travam as duas metades da correção: a chave passou
 * a ser prefixada, e o valor gravado sob a chave antiga é migrado em vez de abandonado.
 */

type MemoryMMKV = ReturnType<typeof createMemoryMMKV>

/** MMKV em memória — só o que `src/store` usa. */
function createMemoryMMKV(seed: Record<string, string> = {}) {
    const data = new Map<string, string>(Object.entries(seed))
    return {
        data,
        set: (key: string, value: unknown) => data.set(key, String(value)),
        getString: (key: string) => data.get(key),
        getNumber: (key: string) => Number(data.get(key) ?? 0),
        getBoolean: (key: string) => data.get(key) === "true",
        remove: (key: string) => data.delete(key),
        getAllKeys: () => Array.from(data.keys()),
        clearAll: () => data.clear(),
    }
}

/**
 * Importa `src/store` do zero sobre um MMKV semeado. O `resetModules` é essencial: a
 * migração roda no import do módulo, então cada cenário precisa de uma carga nova.
 */
async function loadStore(seed: Record<string, string> = {}) {
    const mmkv = createMemoryMMKV(seed)
    vi.resetModules()
    vi.doMock("react-native-mmkv", () => ({ createMMKV: () => mmkv }))
    const store = await import("@/store")
    return { mmkv: mmkv as MemoryMMKV, store }
}

const LEGACY_KEY = "user:profilepicture"
const PREFIXED_KEY = "@circle:user:profilepicture"

describe("chave da foto de perfil", () => {
    it("é declarada com o prefixo @circle:", async () => {
        const { store } = await loadStore()

        expect(store.storageKeys().user.profilePicture).toBe(PREFIXED_KEY)
    })

    it("migra o valor da chave sem prefixo e apaga a órfã", async () => {
        const { mmkv } = await loadStore({ [LEGACY_KEY]: "https://cdn/foto.jpg" })

        expect(mmkv.getString(PREFIXED_KEY)).toBe("https://cdn/foto.jpg")
        expect(mmkv.data.has(LEGACY_KEY)).toBe(false)
    })

    it("não sobrescreve um valor já gravado na chave nova, mas ainda apaga a órfã", async () => {
        const { mmkv } = await loadStore({
            [LEGACY_KEY]: "https://cdn/antiga.jpg",
            [PREFIXED_KEY]: "https://cdn/atual.jpg",
        })

        expect(mmkv.getString(PREFIXED_KEY)).toBe("https://cdn/atual.jpg")
        expect(mmkv.data.has(LEGACY_KEY)).toBe(false)
    })

    it("não faz nada quando não há chave legada", async () => {
        const { mmkv } = await loadStore({ [PREFIXED_KEY]: "https://cdn/atual.jpg" })

        expect(mmkv.getString(PREFIXED_KEY)).toBe("https://cdn/atual.jpg")
        expect(mmkv.data.has(LEGACY_KEY)).toBe(false)
    })

    // O bug em si: antes da correção a foto sobrevivia ao logout, porque a varredura só
    // apaga chaves prefixadas. A asserção precisa cobrir as DUAS chaves — olhar só para a
    // prefixada passaria mesmo com o bug, já que lá nunca houve nada.
    it("a foto não sobrevive ao logout, e o tutorial sobrevive", async () => {
        const { mmkv, store } = await loadStore({
            [LEGACY_KEY]: "https://cdn/foto.jpg",
            "@circle:tutorial:feed:step1Seen": "true",
        })

        store.clearSessionDataPreservingTutorial()

        expect(mmkv.getString(PREFIXED_KEY)).toBeUndefined()
        expect(mmkv.getString(LEGACY_KEY)).toBeUndefined()
        expect(mmkv.getString("@circle:tutorial:feed:step1Seen")).toBe("true")
    })
})
