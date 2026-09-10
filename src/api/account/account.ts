import api from "@/api"
import { accountProps, momentsProps, accountBlocksProps } from "./account.types"

async function getAccount(): Promise<accountProps> {
    const response = await api.get("/account")
    return response.data
}

async function getAccountBlocks({
    limit,
    offset,
}: {
    limit: number
    offset: number
}): Promise<accountBlocksProps> {
    const response = await api.get(`/account/blocks?limit=${limit}&offset=${offset}`)
    return response.data
}

async function getMoments({ page, limit }: { page: number; limit: number }): Promise<momentsProps> {
    const response = await api.get(`/account/moments?page=${page}&limit=${limit}`)
    return response.data
}

async function updateCoordinates({ lat, lng }: { lat: string; lng: string }): Promise<void> {
    const response = await api.put(`/account/coordinates`, {
        latitude: lat,
        longitude: lng,
    })
    return response.data
}

async function updateName({ name }: { name: string }): Promise<void> {
    const response = await api.put(`/account/name`, {
        name,
    })
    return response.data
}

async function updatePushToken({
    expoToken,
    deviceId,
}: {
    expoToken: string
    deviceId: string
}): Promise<void> {
    const response = await api.put(`/account/push-token`, {
        expoToken,
        deviceId,
    })
    return response.data
}

type GetNotificationsParams = {
    limit?: number
    offset?: number
    cursor?: string | null
    read?: "all" | "read" | "unread"
}

async function getNotifications({
    limit = 30,
    offset,
    cursor,
    read = "all",
}: GetNotificationsParams = {}): Promise<any> {
    const search = new URLSearchParams()
    if (typeof limit === "number") search.set("limit", String(limit))
    if (typeof offset === "number") search.set("offset", String(offset))
    if (cursor != null && cursor !== "") search.set("cursor", String(cursor))
    if (read) search.set("read", read)

    // A querystring era montada e descartada: `read`, `limit`, `offset` e
    // `cursor` nunca chegavam no servidor, então toda busca devolvia a mesma
    // página padrão — daí as notificações "voltarem" sempre iguais.
    const query = search.toString()
    const response = await api.get(`/account/notifications${query ? `?${query}` : ""}`)
    return response.data
}

async function readAllNotifications(): Promise<void> {
    // `api.patch(url, data, config)`: o objeto de headers estava indo como
    // CORPO da requisição, e nenhuma config era passada.
    const response = await api.patch(`/account/notifications/read`, {})
    return response.data
}

/**
 * As preferências de notificação que o app conhece.
 *
 * Todas opcionais, e `message` é a chave nova do chat: **ligada por padrão**, inclusive em
 * conta antiga (a migration do backend preencheu `true`). É separada de `friends` de
 * propósito — silenciar convite de amizade não silencia conversa.
 */
export type NotificationPreferences = {
    message?: boolean
    friends?: boolean
    likes?: boolean
    comments?: boolean
    followers?: boolean
    moments?: boolean
}

export type NotificationPreferencesResponse = {
    success: boolean
    preferences: {
        notifications: NotificationPreferences
    }
}

/**
 * Atualiza as preferências de notificação.
 *
 * **Envie só o que mudou.** O backend preserva as demais chaves; mandar o objeto inteiro
 * significaria sobrescrever com o que o app acha que sabe, que pode estar velho se a conta
 * mudou a preferência em outro aparelho.
 */
async function updateNotificationPreferences(
    notifications: NotificationPreferences,
): Promise<NotificationPreferencesResponse> {
    const response = await api.put(`/account/notifications/preferences`, { notifications })
    return response.data
}

export const routes = {
    getAccount,
    getAccountBlocks,
    getMoments,
    updateName,
    updateCoordinates,
    updatePushToken,
    getNotifications,
    readAllNotifications,
    updateNotificationPreferences,
}
