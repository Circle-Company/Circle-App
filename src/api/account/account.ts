import api from "@/api"
import { storage, storageKeys } from "@/store"
import { accountProps, momentsProps, accountBlocksProps } from "./account.types"

async function getAccount(): Promise<accountProps> {
    const response = await api.get("/account", {
        headers: {
            Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
        },
    })
    return response.data
}

async function getAccountBlocks({
    limit,
    offset,
}: {
    limit: number
    offset: number
}): Promise<accountBlocksProps> {
    const response = await api.get(`/account/blocks?limit=${limit}&offset=${offset}`, {
        headers: {
            Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
        },
    })
    return response.data
}

async function getMoments({ page, limit }: { page: number; limit: number }): Promise<momentsProps> {
    const response = await api.get(`/account/moments?page=${page}&limit=${limit}`, {
        headers: {
            Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
        },
    })
    return response.data
}

async function updateDescription({ description }: { description: string }): Promise<void> {
    const response = await api.put(
        `/account/description`,
        {
            description,
        },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
    return response.data
}

async function updateCoordinates({ lat, lng }: { lat: string; lng: string }): Promise<void> {
    const response = await api.put(
        `/account/coordinates`,
        {
            latitude: lat,
            longitude: lng,
        },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
    return response.data
}

async function updateName({ name }: { name: string }): Promise<void> {
    const response = await api.put(
        `/account/name`,
        {
            name,
        },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
    return response.data
}

async function updatePushToken({
    expoToken,
    deviceId,
}: {
    expoToken: string
    deviceId: string
}): Promise<void> {
    const response = await api.put(
        `/account/push-token`,
        {
            expoToken,
            deviceId,
        },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
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

    const response = await api.get(`/account/notifications`, {
        headers: {
            Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
        },
    })
    console.log(response.data)
    return response.data
}

async function readAllNotifications(): Promise<void> {
    const response = await api.patch(`/account/notifications/read`, {
        headers: {
            Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
        },
    })
    return response.data
}

export const routes = {
    getAccount,
    getAccountBlocks,
    getMoments,
    updateDescription,
    updateName,
    updateCoordinates,
    updatePushToken,
    getNotifications,
    readAllNotifications,
}
