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

export const routes = {
    getAccount,
    getAccountBlocks,
    getMoments,
    updateDescription,
    updateName,
    updateCoordinates,
}
