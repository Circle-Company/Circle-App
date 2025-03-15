import api from "../.."
import { PostLikeProps, PostStatisticsPreviewProps, PostUnlikeProps } from "./types"

async function like({ momentId, authorizationToken }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/like`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

async function unlike({ momentId, authorizationToken }: PostUnlikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/unlike`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

async function view({ momentId, authorizationToken }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/view`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

async function hide({ momentId, authorizationToken }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/hide`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

async function unhide({ momentId, authorizationToken }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/unhide`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

async function deleteMoment({ momentId, authorizationToken }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/delete`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

async function undeleteMoment({ momentId, authorizationToken }: PostLikeProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/undelete`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

async function statisticsPreview({ momentId, authorizationToken }: PostStatisticsPreviewProps) {
    return await api.get(`/moments/${momentId}/statistics/preview`, {
        headers: { Authorization: authorizationToken },
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
