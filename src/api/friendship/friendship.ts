import api from "@/api"
import { storage, storageKeys } from "@/store"
import {
    AcceptFriendRequestResponse,
    CancelFriendRequestResponse,
    DeclineFriendRequestResponse,
    FriendRequestsResponse,
    FriendsResponse,
    FriendshipStatusResponse,
    GetFriendRequestsParams,
    GetFriendsParams,
    RemoveFriendResponse,
    SendFriendRequestResponse,
} from "./friendship.types"

function authHeaders() {
    return {
        Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
    }
}

/**
 * Envia convite de amizade. Idempotente: reenviar não duplica convite nem
 * notificação. Pode devolver `outcome: "auto_accepted"` quando o alvo já
 * tinha convidado você — nesse caso a UI já deve mostrar "Amigos".
 */
async function sendFriendRequest({
    userId,
}: {
    userId: string
}): Promise<SendFriendRequestResponse> {
    const response = await api.post(`/users/${userId}/friend-request`, undefined, {
        headers: authHeaders(),
    })
    return response.data
}

/** Cancela o convite que você enviou. 404 se não houver convite pendente seu. */
async function cancelFriendRequest({
    userId,
}: {
    userId: string
}): Promise<CancelFriendRequestResponse> {
    const response = await api.delete(`/users/${userId}/friend-request`, {
        headers: authHeaders(),
    })
    return response.data
}

/** Aceita o convite recebido. `userId` é o de **quem enviou**. */
async function acceptFriendRequest({
    userId,
}: {
    userId: string
}): Promise<AcceptFriendRequestResponse> {
    const response = await api.post(`/users/${userId}/friend-request/accept`, undefined, {
        headers: authHeaders(),
    })
    return response.data
}

/** Recusa o convite recebido. Silencioso: ninguém é notificado. */
async function declineFriendRequest({
    userId,
}: {
    userId: string
}): Promise<DeclineFriendRequestResponse> {
    const response = await api.post(`/users/${userId}/friend-request/decline`, undefined, {
        headers: authHeaders(),
    })
    return response.data
}

/** Desfaz a amizade. Qualquer um dos dois lados pode chamar. */
async function removeFriend({ userId }: { userId: string }): Promise<RemoveFriendResponse> {
    const response = await api.delete(`/users/${userId}/friend`, {
        headers: authHeaders(),
    })
    return response.data
}

/** Status da relação com um usuário. Para o próprio usuário devolve `none`. */
async function getFriendshipStatus({
    userId,
}: {
    userId: string
}): Promise<FriendshipStatusResponse> {
    const response = await api.get(`/users/${userId}/friendship-status`, {
        headers: authHeaders(),
    })
    return response.data
}

/**
 * Lista os amigos de um usuário. Ver a lista de outra pessoa exige poder ver o
 * perfil dela — perfil `friends_only` ou bloqueio devolvem 403.
 */
async function getFriends({
    userId,
    limit = 50,
    offset = 0,
}: GetFriendsParams): Promise<FriendsResponse> {
    const response = await api.get(`/users/${userId}/friends?limit=${limit}&offset=${offset}`, {
        headers: authHeaders(),
    })
    return response.data
}

/**
 * Caixa de convites do usuário logado. `pendingIncomingCount` vem nas duas
 * direções, então uma chamada resolve lista e badge.
 */
async function getFriendRequests({
    direction = "incoming",
    limit = 50,
    offset = 0,
}: GetFriendRequestsParams = {}): Promise<FriendRequestsResponse> {
    const response = await api.get(
        `/account/friend-requests?direction=${direction}&limit=${limit}&offset=${offset}`,
        { headers: authHeaders() },
    )
    return response.data
}

export const routes = {
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    getFriendshipStatus,
    getFriends,
    getFriendRequests,
}
