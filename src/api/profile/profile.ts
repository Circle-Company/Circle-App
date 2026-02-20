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

async function postBlock({ blockedUserId }: { blockedUserId: string }): Promise<void> {
    await api.post(`/users/${blockedUserId}/block`, {
        headers: {
            Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
        },
    })
}

async function deleteBlock({ unlockedUserId }: { unlockedUserId: string }): Promise<void> {
    await api.delete(`/users/${unlockedUserId}/block`, {
        headers: {
            Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
        },
    })
}

async function postReport(props: {
    userId: string
    reason: string
    description: string
}): Promise<void> {
    await api.post(
        `/users/${props.userId}/reports`,
        {
            reason: props.reason,
            description: props.description,
        },
        {
            headers: {
                Authorization: `Bearer ${storage.getString(storageKeys().account.jwt.token) || ""}`,
            },
        },
    )
}

export const routes = {
    getAccount,
    getMoments,
    postBlock,
    deleteBlock,
    postReport,
}
