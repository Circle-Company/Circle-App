import React from "react"
import { NotificationPayload } from "@/contexts/push.notification"
import { useToast } from "./index"

/**
 * Hook for showing a notification as an in-app toast.
 *
 * Usage:
 *   const { show } = useNotificationToast()
 *   show(notificationPayload)
 */
export function useNotificationToast() {
    const toast = useToast()

    const show = React.useCallback(
        (payload: NotificationPayload, duration = 4000) => {
            toast.notification(payload, { duration })
        },
        [toast],
    )

    const hide = React.useCallback(() => {
        toast.hide()
    }, [toast])

    return { show, hide }
}
