import type { AccountStatus as BackendAccountStatus } from "@/session/schema"

import type { AccountMoment, AccountTerms } from "../types"

/** Identidade e perfil de exibição. */
export type AccountIdentity = {
    userId: string
    username: string
    name: string
    profilePicture: string
}

/**
 * O status vem de `src/session/schema` e é **importado com alias**, não redefinido: é o
 * mesmo fato do backend, e duas definições seriam duas fontes para uma verdade só.
 * `active` é o único acréscimo — a sessão não decide nada com ele, o app decide.
 */
export type AccountStatusState = BackendAccountStatus & { active: boolean }

export type AccountCoordinates = {
    latitude: number
    longitude: number
    /** ISO da última sincronização. Diagnóstico: permite decidir se vale perguntar a
     * localização de novo em vez de reusar a última conhecida. */
    syncedAt?: string
}

/** O que vai para `@circle:account`. As coleções ficam fora, cada uma na sua chave. */
export type PersistedAccount = {
    schemaVersion: number
    /** Redundante com `session.identity.userId` **de propósito**: é o que permite
     * detectar dado órfão de outro usuário na hidratação (§2.6). */
    userId: string
    profile: Omit<AccountIdentity, "userId">
    status: AccountStatusState
    terms: AccountTerms
    /** Contagem do backend. Mora no blob porque publicar é raro — reescrever o perfil
     * junto custa uma escrita por publicação, não uma por toque. */
    coordinates?: AccountCoordinates
}

/**
 * O estado em memória e as ações. Note que **não há nenhum campo de JWT**: quem é dono do
 * par de tokens é a `Session` (`src/session/`), e essa separação é o item 1 do §0.
 */
export interface AccountState extends AccountIdentity {
    // status da conta (vinha de persist.account, e `isVerified` de persist.user)
    isVerified: boolean
    isActive: boolean
    blocked: boolean
    deleted: boolean
    accessLevel: string
    terms: AccountTerms

    // interação: em memória vivem aqui, mas cada uma persiste na SUA chave
    moments: AccountMoment[]
    likedMoments: string[]
    hiddenMoments: string[]
    readNotifications: string[]
    coordinates: AccountCoordinates

    setIdentity: (value: AccountIdentity) => void
    setStatus: (value: AccountStatusState) => void
    setTerms: (value: AccountTerms) => void
    setCoordinates: (value: { latitude: number; longitude: number }) => void

    setMoments: (value: AccountMoment[]) => void
    setLikedMoments: (value: string[]) => void
    addLikedMoment: (id: string) => void
    removeLikedMoment: (id: string) => void
    setHiddenMoments: (value: string[]) => void
    addHiddenMoment: (id: string) => void
    removeHiddenMoment: (id: string) => void
    setReadNotifications: (value: string[]) => void
    addReadNotifications: (ids: string[]) => void

    /** Lê tudo do storage. `expectedUserId` é o guard de dado órfão do §2.6. */
    hydrate: (expectedUserId?: string) => void
    /** Zera memória **e** storage. Uma operação, um dono — §11.2. */
    clear: () => void
}
