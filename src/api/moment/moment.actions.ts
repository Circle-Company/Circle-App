import type { BaseAction, commentAction, watchTimeAction, reportAction } from "./moment.types"
import api from "@/api"
import { storage, storageKeys } from "@/store"

const WATCH_DEBOUNCE_MS = 400
type WatchDebounceEntry = { timer: any; lastWatchTime: number }
const watchDebounceMap = new Map<string, WatchDebounceEntry>()

async function flushWatch(momentId: string, watchTime: number): Promise<void> {
    const token = storage.getString(storageKeys().account.jwt.token) || ""
    const tokenPreview = token.slice ? token.slice(0, 10) : ""
    const url = `/moments/${momentId}/watch`

    try {
        const res = await api.post(url, { watchTime: Math.round(watchTime / 1000) })
        console.log(
            "WATCH flush -> success",
            JSON.stringify({ url, status: res?.status ?? "unknown" }),
        )
    } catch (error: any) {
        const code = error?.response?.status
        let dataStr = ""
        try {
            dataStr = JSON.stringify(error?.response?.data)
        } catch {
            dataStr = "[unserializable]"
        }
        console.error("WATCH flush -> error", code, dataStr)
    } finally {
        watchDebounceMap.delete(momentId)
    }
}

export async function like(props: BaseAction): Promise<void> {
    await api.post(`/moments/${props.momentId}/like`, {})
}

export async function report(props: reportAction): Promise<void> {
    await api.post(
        `/moments/${props.momentId}/report`,
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

export async function unlike(props: BaseAction): Promise<void> {
    await api.post(`/moments/${props.momentId}/unlike`, {})
}

export async function watch(props: watchTimeAction): Promise<void> {
    const id = props.momentId
    const ms = props.watchTime
    const existing = watchDebounceMap.get(id)
    const now = Date.now()

    if (existing) {
        if (existing.timer) {
            clearTimeout(existing.timer)
        }
        console.log(
            "WATCH debounce -> update",
            JSON.stringify({ momentId: id, watchTime: ms, debounceMs: WATCH_DEBOUNCE_MS, ts: now }),
        )
        existing.lastWatchTime = ms
        existing.timer = setTimeout(() => {
            console.log(
                "WATCH debounce -> trigger",
                JSON.stringify({ momentId: id, watchTime: existing.lastWatchTime, ts: Date.now() }),
            )
            flushWatch(id, existing.lastWatchTime)
        }, WATCH_DEBOUNCE_MS) as any
        watchDebounceMap.set(id, existing)
    } else {
        console.log(
            "WATCH debounce -> schedule",
            JSON.stringify({ momentId: id, watchTime: ms, debounceMs: WATCH_DEBOUNCE_MS, ts: now }),
        )
        const entry: WatchDebounceEntry = {
            lastWatchTime: ms,
            timer: setTimeout(() => {
                console.log(
                    "WATCH debounce -> trigger",
                    JSON.stringify({ momentId: id, watchTime: ms, ts: Date.now() }),
                )
                flushWatch(id, ms)
            }, WATCH_DEBOUNCE_MS) as any,
        }
        watchDebounceMap.set(id, entry)
    }
}

export async function comment(props: commentAction): Promise<void> {
    await api.post(`/moments/${props.momentId}/comments`, {
        content: props.content,
        mentions: props.mentions,
        parentId: props.parentId,
    })
}
