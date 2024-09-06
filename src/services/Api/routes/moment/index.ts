import api from "../.."
import { storage, storageKeys } from "../../../../store"
import { PostLikeProps, PostStatisticsPreviewProps, PostUnlikeProps } from "./types"

async function like({ momentId }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/like`,
        {},
        {
            headers: {
                authorization_token: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function unlike({ momentId }: PostUnlikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/unlike`,
        {},
        {
            headers: {
                authorization_token: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function view({ momentId }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/view`,
        {},
        {
            headers: {
                authorization_token: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function hide({ momentId }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/hide`,
        {},
        {
            headers: {
                authorization_token: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function unhide({ momentId }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/unhide`,
        {},
        {
            headers: {
                authorization_token: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function deleteMoment({ momentId }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/delete`,
        {},
        {
            headers: {
                authorization_token: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function undeleteMoment({ momentId }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/undelete`,
        {},
        {
            headers: {
                authorization_token: storage.getString(storageKeys().account.jwt.token) || "",
            },
        }
    )
}

async function statisticsPreview({ momentId }: PostStatisticsPreviewProps) {
    return await api.get(`/moments/${momentId}/statistics/preview`, {
        headers: { authorization_token: storage.getString(storageKeys().account.jwt.token) || "" },
    })
}

export const routes = {
    like,
    unlike,
    view,
    hide,
    unhide,
    delete: deleteMoment,
    undelete: undeleteMoment,

    statisticsPreview,
}
