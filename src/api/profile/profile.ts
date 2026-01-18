import api from "@/api"
import { storage, storageKeys } from "@/store"
import { accountProps, momentsProps } from "@/api/account/account.types"

async function getAccount(): Promise<accountProps> {
    const response = await api.get("/account", {
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

export const routes = {
    getAccount,
    getMoments,
}
