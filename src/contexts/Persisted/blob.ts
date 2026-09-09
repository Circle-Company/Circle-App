import { safeDelete, storage, type ScopedKey } from "@/store"

import { isObject } from "./coerce"

/**
 * O ciclo de vida de um blob no MMKV: ler, gravar, apagar — com o mesmo tratamento de erro
 * em todos os três.
 *
 * As três stores persistidas repetiam este ciclo inteiro, cada uma com o seu try/catch, o
 * seu `JSON.parse` e a sua decisão sobre o que fazer com dado corrompido. O que muda de uma
 * para outra é só **o parse**; o resto era cópia.
 *
 * Duas regras que valem para as três e que estão garantidas aqui:
 *
 * 1. **Nada lança.** Storage recusando leitura ou escrita não pode derrubar a interação do
 *    usuário. O pior caso é o app se comportar como se não houvesse dado guardado.
 * 2. **Dado inválido vira o padrão, nunca `undefined`.** Um blob corrompido é indistinguível
 *    de um blob ausente para quem lê — e é assim que deve ser, porque a alternativa é cada
 *    chamador inventar o próprio fallback.
 */

export type BlobStorage<T> = {
    /** Lê e valida. Devolve `empty()` quando não há nada, o JSON é inválido, ou o parse recusa. */
    read: () => T
    /** Grava o blob inteiro, carimbando `schemaVersion`. */
    write: (value: T) => void
    clear: () => void
}

export type BlobOptions<T> = {
    key: ScopedKey
    schemaVersion: number
    /** Recebe o objeto cru já garantido como objeto. Devolver `null` cai no `empty()`. */
    parse: (data: Record<string, unknown>) => T | null
    /** O estado de "não há nada guardado". Função, e não constante, para cada chamada
     * devolver objetos aninhados novos — referência compartilhada entre sessões é como uma
     * mutação acidental atravessa de um usuário para o outro. */
    empty: () => T
}

export function createBlobStorage<T>({
    key,
    schemaVersion,
    parse,
    empty,
}: BlobOptions<T>): BlobStorage<T> {
    return {
        read: () => {
            try {
                const raw = storage.getString(key)
                if (!raw) return empty()

                const data = JSON.parse(raw)
                if (!isObject(data)) return empty()

                return parse(data) ?? empty()
            } catch {
                return empty()
            }
        },

        write: (value: T) => {
            try {
                storage.set(key, JSON.stringify({ schemaVersion, ...value }))
            } catch {
                // noop — ver a regra 1 no topo
            }
        },

        clear: () => safeDelete(key),
    }
}

/** Leitura crua de uma chave que não é blob — usada pelas coleções do `account`. */
export const readRaw = (key: ScopedKey): string | undefined => {
    try {
        return storage.getString(key) || undefined
    } catch {
        return undefined
    }
}

/** Escrita de JSON numa chave avulsa, com o mesmo contrato de "não lança". */
export const writeJson = (key: ScopedKey, value: unknown) => {
    try {
        storage.set(key, JSON.stringify(value))
    } catch {
        // noop
    }
}
