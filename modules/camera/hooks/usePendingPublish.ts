import { useCallback, useEffect, useRef, useState } from "react"
import { useSharedValue, withTiming, type SharedValue } from "react-native-reanimated"

export interface PendingPublishItem {
    path: string
    duration: number
    mimeType: string
}

interface Options {
    /** How long the cancel window stays open before the item is committed. */
    windowMs: number
    /** Called when the countdown expires OR when a new item is scheduled while
     *  another is still pending (user moved on — publish the old one). */
    onCommit: (item: PendingPublishItem) => void
}

interface Result {
    pending: PendingPublishItem | null
    /** 1 → 0 over `windowMs`, drives the cancel card's countdown bar. */
    progress: SharedValue<number>
    schedule: (item: PendingPublishItem) => void
    cancel: () => void
}

// Holds a video clip in a cancellable "about to publish" state. Anything
// still pending when a NEW clip is scheduled is committed immediately — the
// user chose to keep shooting and their previous shot loses its undo window.
export function usePendingPublish({ windowMs, onCommit }: Options): Result {
    const [pending, setPending] = useState<PendingPublishItem | null>(null)
    const pendingRef = useRef<PendingPublishItem | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const progress = useSharedValue(1)

    pendingRef.current = pending

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }

    const cancel = useCallback(() => {
        clearTimer()
        setPending(null)
        progress.value = 1
    }, [progress])

    const schedule = useCallback(
        (item: PendingPublishItem) => {
            // Commit any still-pending item — user decided to shoot again.
            if (pendingRef.current) {
                clearTimer()
                onCommit(pendingRef.current)
            }

            setPending(item)
            progress.value = 1
            progress.value = withTiming(0, { duration: windowMs })

            timerRef.current = setTimeout(() => {
                timerRef.current = null
                if (pendingRef.current === item) {
                    setPending(null)
                    onCommit(item)
                }
            }, windowMs)
        },
        [onCommit, progress, windowMs],
    )

    useEffect(() => {
        return () => clearTimer()
    }, [])

    return { pending, progress, schedule, cancel }
}
