/**
 * A fronteira com o MMKV. Nada aqui conhece a store — é o que permite testar o formato em
 * disco sem instanciar Zustand nenhum.
 *
 * O `account` é o único dos três que **não** usa `createBlobStorage` direto: além do blob
 * de perfil ele tem quatro coleções, cada uma na sua chave (§2.2/P2). O que ele reaproveita
 * de `../blob` é o par `readRaw`/`writeJson`, com o mesmo contrato de nunca lançar.
 */

import { safeDelete, storageKeys, type ScopedKey } from "@/store"

import { readRaw, writeJson } from "../blob"
import { asNumber, asString, isObject , capList } from "../coerce"
import type { PersistedAccount, AccountState } from "./account.types"

const BASE = storageKeys().baseKey

/**
 * Uma chave por unidade de escrita (§2.2/P2). O perfil vai num blob só, porque é lido junto
 * e muda raro. Cada coleção vai na **sua** chave, porque é apendada a cada toque: se morasse
 * no blob, um like reescreveria o perfil inteiro junto.
 *
 * O prefixo comum `@circle:account` não é cosmético — é o que faz `clearUserScopedData()`
 * (`../scopes`) alcançar todas elas por escopo declarado, sem lista de exceções.
 */
export const ACCOUNT_KEYS = {
    blob: `${BASE}account`,
    liked: `${BASE}account:liked`,
    hidden: `${BASE}account:hidden`,
    readNotifications: `${BASE}account:read-notifications`,
    moments: `${BASE}account:moments`,
} as const

export const ACCOUNT_SCHEMA_VERSION = 1

/**
 * Tolerante por construção: um campo novo (ou sumido) do backend não pode derrubar o blob
 * inteiro. Só a ausência de `userId` invalida — sem ele não há como saber de quem é o
 * dado, que é justamente a pergunta do §2.6.
 */
export function parseBlob(raw: string | undefined): PersistedAccount | null {
    if (!raw) return null
    try {
        const data = JSON.parse(raw)
        if (!isObject(data)) return null

        const userId = asString(data.userId)
        if (!userId) return null

        const profile = isObject(data.profile) ? data.profile : {}
        const status = isObject(data.status) ? data.status : {}
        const terms = isObject(data.terms) ? data.terms : {}
        const coordinates = isObject(data.coordinates) ? data.coordinates : null

        return {
            schemaVersion: asNumber(data.schemaVersion) || ACCOUNT_SCHEMA_VERSION,
            userId,
            profile: {
                username: asString(profile.username),
                name: asString(profile.name),
                profilePicture: asString(profile.profilePicture),
            },
            status: {
                accessLevel: asString(status.accessLevel),
                verified: status.verified === true,
                active: status.active === true,
                blocked: status.blocked === true,
                deleted: status.deleted === true,
            },
            terms: {
                agreed: terms.agreed === true,
                version: asString(terms.version),
                agreedAt: asString(terms.agreedAt),
            },
            coordinates: coordinates
                ? {
                      latitude: asNumber(coordinates.latitude),
                      longitude: asNumber(coordinates.longitude),
                      syncedAt: asString(coordinates.syncedAt) || undefined,
                  }
                : undefined,
        }
    } catch {
        return null
    }
}

/** O blob é sempre reescrito inteiro, a partir do estado corrente. */
export function writeBlob(state: AccountState) {
    const blob: PersistedAccount = {
        schemaVersion: ACCOUNT_SCHEMA_VERSION,
        userId: state.userId,
        profile: {
            username: state.username,
            name: state.name,
            profilePicture: state.profilePicture,
        },
        status: {
            accessLevel: state.accessLevel,
            verified: state.isVerified,
            active: state.isActive,
            blocked: state.blocked,
            deleted: state.deleted,
        },
        terms: state.terms,
        coordinates: state.coordinates,
    }
    writeJson(ACCOUNT_KEYS.blob, blob)
}

/**
 * Lê uma coleção já dentro do teto, e **cura o storage** quando ele estava acima dele:
 * uma lista legada de dezenas de milhares de ids é aparada na primeira hidratação, em vez
 * de ser reparseada inteira em todo cold start.
 */
export function readCollection<T>(
    key: ScopedKey,
    parse: (raw: string | undefined) => T[],
    max?: number,
): T[] {
    const parsed = parse(readRaw(key))
    if (max === undefined) return parsed

    const capped = capList(parsed, max)
    if (capped !== parsed) writeJson(key, capped)
    return capped
}

/** Apaga as cinco chaves da conta. Usado pelo `clear()` e pelo guard de dado órfão. */
export function clearStorage() {
    for (const key of Object.values(ACCOUNT_KEYS)) safeDelete(key)
}
