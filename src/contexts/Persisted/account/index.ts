import { create } from "zustand"

import { readRaw, writeJson } from "../blob"
import { asNumber, asString ,
    COLLECTION_LIMITS,
    appendUnique,
    capList,
    mergeUnique,
    normalizeIds,
    parseIdList,
    parseObjectList,
    removeId,
} from "../coerce"
import type { AccountMoment, AccountTerms } from "../types"
import {
    ACCOUNT_KEYS,
    clearStorage,
    parseBlob,
    readCollection,
    writeBlob,
} from "./account.persistence"
import type { AccountCoordinates, AccountIdentity, AccountState, AccountStatusState } from "./account.types"

/**
 * A conta: o usuário logado, inteiro — `docs/session-management.md` §2.5 e §11.2.
 *
 * Nasceu da fusão de `persist.account.ts` + `persist.user.ts`. A separação anterior não
 * descrevia duas entidades: descrevia dois objetos do payload de login (`session.user` e
 * `session.status`) — recorte do backend, não do app. Depois que os tokens saíram para
 * `src/session/`, o que restava em `persist.account` (status, termos, coordenadas e as
 * coleções de interação) era a mesma entidade que `persist.user` já guardava. Era por isso
 * que `verified` existia em duplicata, gravado duas vezes a cada login.
 *
 * **Aqui não há nenhum campo de JWT.** Quem é dono do par de tokens é a `Session`, e ter
 * vários donos era o que permitia duas escritas concorrentes ressuscitarem um token já
 * invalidado (item 1 do §0).
 *
 * O parse e a escrita em disco ficam em `./persistence.ts` — é o único dos três stores que
 * separa isso, porque tem quatro coleções além do blob e um parse que vale exercitar sem
 * instanciar Zustand nenhum.
 */

/** O estado de "ninguém logado". Função, e não constante — ver a nota em `../blob.ts`. */
export const emptyState = () => ({
    userId: "",
    username: "",
    name: "",
    profilePicture: "",
    isVerified: false,
    isActive: false,
    blocked: false,
    deleted: false,
    accessLevel: "",
    terms: { agreed: false, version: "", agreedAt: "" } as AccountTerms,
    moments: [] as AccountMoment[],
    likedMoments: [] as string[],
    hiddenMoments: [] as string[],
    readNotifications: [] as string[],
    coordinates: { latitude: 0, longitude: 0 } as AccountCoordinates,
})

/**
 * Um padrão se repete nas ações de coleção e vale explicar uma vez: elas comparam a
 * **referência** antes de escrever. Os helpers devolvem o mesmo array quando nada mudou,
 * então `next === current` significa "essa operação foi no-op" — e escrever no MMKV a cada
 * toque de um like já marcado seria I/O puro no caminho quente do feed.
 */
export const useAccountStore = create<AccountState>((set, get) => ({
    // Estado inicial vazio, **sem I/O no import**: hidratar é responsabilidade explícita
    // do provider, a partir do evento `signed-in`/`resumed` da sessão. Ler o storage no
    // construtor do store é o que hoje põe o parse das coleções no caminho crítico do
    // cold start, antes mesmo de o app saber se há sessão.
    ...emptyState(),

    setIdentity: (value: AccountIdentity) => {
        set({
            userId: asString(value.userId),
            username: asString(value.username),
            name: asString(value.name),
            profilePicture: asString(value.profilePicture),
        })
        writeBlob(get())
    },

    setStatus: (value: AccountStatusState) => {
        set({
            accessLevel: asString(value.accessLevel),
            isVerified: value.verified === true,
            isActive: value.active === true,
            blocked: value.blocked === true,
            deleted: value.deleted === true,
        })
        writeBlob(get())
    },

    setTerms: (value: AccountTerms) => {
        set({
            terms: {
                agreed: value?.agreed === true,
                version: asString(value?.version),
                agreedAt: asString(value?.agreedAt),
            },
        })
        writeBlob(get())
    },

    setCoordinates: (value: { latitude: number; longitude: number }) => {
        set({
            coordinates: {
                latitude: asNumber(value.latitude),
                longitude: asNumber(value.longitude),
                syncedAt: new Date().toISOString(),
            },
        })
        writeBlob(get())
    },

    setMoments: (value: AccountMoment[]) => {
        const moments = capList(Array.isArray(value) ? value : [], COLLECTION_LIMITS.moments)
        set({ moments })
        writeJson(ACCOUNT_KEYS.moments, moments)
    },

    setLikedMoments: (value: string[]) => {
        const likedMoments = capList(normalizeIds(value), COLLECTION_LIMITS.liked)
        set({ likedMoments })
        writeJson(ACCOUNT_KEYS.liked, likedMoments)
    },

    addLikedMoment: (id: string) => {
        const current = get().likedMoments
        const next = capList(appendUnique(current, id), COLLECTION_LIMITS.liked)
        if (next === current) return
        set({ likedMoments: next })
        writeJson(ACCOUNT_KEYS.liked, next)
    },

    removeLikedMoment: (id: string) => {
        const current = get().likedMoments
        const next = removeId(current, id)
        if (next === current) return
        set({ likedMoments: next })
        writeJson(ACCOUNT_KEYS.liked, next)
    },

    // `hidden` não tem teto: é intenção explícita do usuário, e aparar a lista devolveria
    // à tela um momento que ele mandou sumir.
    setHiddenMoments: (value: string[]) => {
        const hiddenMoments = normalizeIds(value)
        set({ hiddenMoments })
        writeJson(ACCOUNT_KEYS.hidden, hiddenMoments)
    },

    addHiddenMoment: (id: string) => {
        const current = get().hiddenMoments
        const next = appendUnique(current, id)
        if (next === current) return
        set({ hiddenMoments: next })
        writeJson(ACCOUNT_KEYS.hidden, next)
    },

    removeHiddenMoment: (id: string) => {
        const current = get().hiddenMoments
        const next = removeId(current, id)
        if (next === current) return
        set({ hiddenMoments: next })
        writeJson(ACCOUNT_KEYS.hidden, next)
    },

    setReadNotifications: (value: string[]) => {
        const readNotifications = capList(normalizeIds(value), COLLECTION_LIMITS.readNotifications)
        set({ readNotifications })
        writeJson(ACCOUNT_KEYS.readNotifications, readNotifications)
    },

    addReadNotifications: (ids: string[]) => {
        const current = get().readNotifications
        const merged = mergeUnique(current, Array.isArray(ids) ? ids : [])
        if (merged === current) return
        const next = capList(merged, COLLECTION_LIMITS.readNotifications)
        set({ readNotifications: next })
        writeJson(ACCOUNT_KEYS.readNotifications, next)
    },

    hydrate: (expectedUserId?: string) => {
        const blob = parseBlob(readRaw(ACCOUNT_KEYS.blob))

        // Segunda linha de defesa do §2.6: se a limpeza do login não rodou, o dado do
        // usuário anterior ainda está aqui. Carregá-lo mostraria os likes e as
        // notificações lidas de outra pessoa — é vazamento, não inconveniência. As
        // coleções morrem junto com o blob porque não têm âncora própria de identidade:
        // preservá-las seria descartar o crachá e ficar com o conteúdo.
        if (blob && expectedUserId !== undefined && blob.userId !== expectedUserId) {
            clearStorage()
            set(emptyState())
            return
        }

        const collections = {
            moments: readCollection<AccountMoment>(
                ACCOUNT_KEYS.moments,
                parseObjectList,
                COLLECTION_LIMITS.moments,
            ),
            likedMoments: readCollection(ACCOUNT_KEYS.liked, parseIdList, COLLECTION_LIMITS.liked),
            hiddenMoments: readCollection(ACCOUNT_KEYS.hidden, parseIdList),
            readNotifications: readCollection(
                ACCOUNT_KEYS.readNotifications,
                parseIdList,
                COLLECTION_LIMITS.readNotifications,
            ),
        }

        if (!blob) {
            set({ ...emptyState(), ...collections })
            return
        }

        set({
            userId: blob.userId,
            ...blob.profile,
            accessLevel: blob.status.accessLevel,
            isVerified: blob.status.verified,
            isActive: blob.status.active,
            blocked: blob.status.blocked,
            deleted: blob.status.deleted,
            terms: blob.terms,
            coordinates: blob.coordinates ?? { latitude: 0, longitude: 0 },
            ...collections,
        })
    },

    clear: () => {
        clearStorage()
        set(emptyState())
    },
}))

export type {
    AccountCoordinates,
    AccountIdentity,
    AccountState,
    AccountStatusState,
    PersistedAccount,
} from "./account.types"

export { ACCOUNT_KEYS, ACCOUNT_SCHEMA_VERSION } from "./account.persistence"
