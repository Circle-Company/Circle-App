/**
 * MMKV em memória para testes que precisam do `src/store` **de verdade**.
 *
 * `src/test-setup.ts` mocka `@/store` globalmente com uma forma fixa, o que serve para a
 * maioria dos testes mas impede exercitar o storage real. Quem usar este helper precisa
 * chamar `vi.unmock("@/store")` no topo do arquivo de teste.
 *
 * Não é um `.spec.ts`, então o vitest não o coleta como suíte.
 */

export type MemoryMMKV = {
    data: Map<string, string>
    set: (key: string, value: unknown) => void
    getString: (key: string) => string | undefined
    getNumber: (key: string) => number | undefined
    getBoolean: (key: string) => boolean | undefined
    remove: (key: string) => void
    getAllKeys: () => string[]
    clearAll: () => void
}

/**
 * O MMKV real é tipado por valor: `getNumber` numa chave ausente devolve `undefined`, e
 * `getBoolean` só devolve `true`/`false` para o que foi gravado como boolean. A imitação
 * aqui guarda tudo como string e reconstrói o tipo na leitura — o suficiente para o que
 * `src/store` e `src/session` fazem.
 */
export function createMemoryMMKV(seed: Record<string, string> = {}): MemoryMMKV {
    const data = new Map<string, string>(Object.entries(seed))

    return {
        data,
        set: (key, value) => data.set(key, String(value)),
        getString: (key) => data.get(key),
        getNumber: (key) => {
            const raw = data.get(key)
            if (raw === undefined) return undefined
            const parsed = Number(raw)
            return Number.isFinite(parsed) ? parsed : undefined
        },
        getBoolean: (key) => {
            const raw = data.get(key)
            if (raw === undefined) return undefined
            return raw === "true"
        },
        remove: (key) => {
            data.delete(key)
        },
        getAllKeys: () => Array.from(data.keys()),
        clearAll: () => data.clear(),
    }
}

/** Monta um JWT sem assinatura válida — o app nunca verifica assinatura (§4). */
export function makeJwt(payload: Record<string, unknown>): string {
    const encode = (value: object) =>
        Buffer.from(JSON.stringify(value))
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "")

    return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.assinatura-falsa`
}
