/**
 * Tipos da API de amizade (substitui o antigo modelo de follow).
 * Referência: docs/friendship-api.md
 */

/** O que o usuário logado vê sobre a relação com outro usuário. */
export type FriendshipRelation =
    "none" | "pending_outgoing" | "pending_incoming" | "friends" | "declined"

/** Estado bruto do convite. As listagens só devolvem `pending` hoje. */
export type FriendRequestStatus = "pending" | "accepted" | "declined" | "cancelled"

/** Resultado de `POST /users/:id/friend-request`. */
export type FriendRequestOutcome =
    "created" | "auto_accepted" | "already_pending" | "already_friends"

export type FriendshipErrorCode =
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "USER_NOT_FOUND"
    | "INTERNAL_ERROR"
    | "AUTHENTICATION_REQUIRED"

export type SendFriendRequestResponse = {
    success: boolean
    outcome: FriendRequestOutcome
    areFriends: boolean
    error?: string
    code?: FriendshipErrorCode
}

export type CancelFriendRequestResponse = {
    success: boolean
    cancelled: boolean
    error?: string
    code?: FriendshipErrorCode
}

export type AcceptFriendRequestResponse = {
    success: boolean
    areFriends: boolean
    error?: string
    code?: FriendshipErrorCode
}

export type DeclineFriendRequestResponse = {
    success: boolean
    declined: boolean
    error?: string
    code?: FriendshipErrorCode
}

export type RemoveFriendResponse = {
    success: boolean
    removed: boolean
    error?: string
    code?: FriendshipErrorCode
}

export type FriendshipStatusResponse = {
    success: boolean
    relation: FriendshipRelation
    areFriends: boolean
    error?: string
    code?: FriendshipErrorCode
}

/** Item de `GET /users/:id/friends`. `name` e `profilePictureUrl` podem vir nulos. */
export type Friend = {
    id: string
    username: string
    name: string | null
    profilePictureUrl: string | null
}

export type FriendsResponse = {
    success: boolean
    /** Contagem completa de amigos (não o tamanho da página) — use no contador. */
    total: number
    friends: Friend[]
    error?: string
    code?: FriendshipErrorCode
}

export type FriendRequestsDirection = "incoming" | "outgoing"

/**
 * Item da caixa de convites. `userId` já é **o outro lado** da relação:
 * quem convidou em `incoming`, quem foi convidado em `outgoing`.
 */
export type FriendRequestInvite = {
    id: string
    userId: string
    status: FriendRequestStatus
    relation: FriendshipRelation
    requestedAt: string
    respondedAt: string | null
    becameFriendsAt: string | null
}

export type FriendRequestsResponse = {
    success: boolean
    direction: FriendRequestsDirection
    /** Vem nas duas direções — use direto no badge, sem chamada extra. */
    pendingIncomingCount: number
    invites: FriendRequestInvite[]
    error?: string
    code?: FriendshipErrorCode
}

export type GetFriendsParams = {
    userId: string
    /** default 50, teto 200 (o backend trunca, não rejeita) */
    limit?: number
    offset?: number
}

export type GetFriendRequestsParams = {
    direction?: FriendRequestsDirection
    limit?: number
    offset?: number
}
