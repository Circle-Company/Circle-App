import { BaseAction, commentAction, watchTimeAction } from "./moment.types"
import api from "@/api"

export async function like(props: BaseAction): Promise<void> {
    await api.post(`/moments/${props.momentId}/like`, {
        headers: {
            Authorization: props.authorizationToken,
        },
    })
}

export async function unlike(props: BaseAction): Promise<void> {
    await api.post(`/moments/${props.momentId}/unlike`, {
        headers: {
            Authorization: props.authorizationToken,
        },
    })
}

export async function watch(props: watchTimeAction): Promise<void> {
    await api.post(
        `/moments/${props.momentId}/watch`,
        { watchTime: props.watchTime },
        {
            headers: {
                Authorization: props.authorizationToken,
            },
        },
    )
}

export async function comment(props: commentAction): Promise<void> {
    await api.post(
        `/moments/${props.momentId}/comments`,
        {
            content: props.content,
            mentions: props.mentions,
            parentId: props.parentId,
        },
        {
            headers: {
                Authorization: props.authorizationToken,
            },
        },
    )
}
