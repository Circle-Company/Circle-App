import api from "@/api"
import { accountProps, momentsProps } from "@/api/account/account.types"

async function getAccount(): Promise<accountProps> {
    const response = await api.get("/account")
    return response.data
}

async function getMoments({ page, limit }: { page: number; limit: number }): Promise<momentsProps> {
    const response = await api.get(`/account/moments?page=${page}&limit=${limit}`)
    return response.data
}

async function postBlock({ blockedUserId }: { blockedUserId: string }): Promise<void> {
    await api.post(`/users/${blockedUserId}/block`)
}

async function deleteBlock({ unlockedUserId }: { unlockedUserId: string }): Promise<void> {
    await api.delete(`/users/${unlockedUserId}/block`)
}

async function postReport(props: {
    userId: string
    reason: string
    description: string
}): Promise<void> {
    await api.post(`/users/${props.userId}/reports`, {
        reason: props.reason,
        description: props.description,
    })
}

export const routes = {
    getAccount,
    getMoments,
    postBlock,
    deleteBlock,
    postReport,
}
