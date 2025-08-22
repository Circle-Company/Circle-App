import { MomentActionProps, MomentActionPropsWithReportType } from "./types"

import api from "../../index"

export async function like({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
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

export async function unlike({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
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

export async function share({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/share`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

export async function partialView({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/partial-view`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

export async function completeView({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/complete-view`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

export async function click({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/click`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

export async function likeComment({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/like-comment`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

export async function comment({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/comment`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

export async function showLessOften({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/show-less-often`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

export async function report({ momentId, authorizationToken }: MomentActionProps): Promise<void> {
    await api.post(
        `/moments/${momentId}/report`,
        {},
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}

export async function reportComment({ momentId, authorizationToken, reportType }: MomentActionPropsWithReportType): Promise<void> {
    await api.post(
        `/moments/${momentId}/comment/report`,
        { report_type: reportType },
        {
            headers: {
                Authorization: authorizationToken,
            },
        }
    )
}