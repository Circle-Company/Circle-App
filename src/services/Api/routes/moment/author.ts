import { MomentActionProps, MomentActionPropsWithCommentType } from "./types"

import api from "../.."

export async function hide({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
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

export async function unhide({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
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

export async function deleteMoment({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
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

export async function deleteComment({ momentId, commentId, authorizationToken }: MomentActionPropsWithCommentType): Promise<void> {
    await api.post(
        `/moments/${momentId}/comments/${commentId}/delete`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

export async function undelete({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
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

export async function statisticsPreview({ momentId, authorizationToken }: MomentActionProps) {
    return await api.get(`/moments/${momentId}/statistics/preview`, {
        headers: { Authorization: authorizationToken },
    })
}
