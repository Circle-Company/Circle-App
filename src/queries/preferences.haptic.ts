import { useMutation } from "@tanstack/react-query"
import React from "react"
import { useToast } from "@/contexts/Toast"
import PersistedContext from "@/contexts/Persisted"
import { apiRoutes } from "@/api"
import { trackUserAction } from "@/lib/trackEvent"

export function useDisableHapticsMutation() {
    const { session } = React.useContext(PersistedContext)
    const toast = useToast()
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.content.setHaptics({
                userId: session.account.userId,
                disableHaptics: true,
            })
        },
        onSuccess: () => {
            trackUserAction("haptics_disabled")
            session.preferences.setDisableHaptics(true)
            toast.success("Haptics disabled successfully")
        },
        onError: (error: any) => {
            toast.error(error.name || error.message || "An error occurred")
        },
    })

    return mutation
}

export function useEnableEnableMutation() {
    const { session } = React.useContext(PersistedContext)
    const toast = useToast()
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.content.setHaptics({
                userId: session.account.userId,
                disableHaptics: false,
            })
        },
        onSuccess: () => {
            trackUserAction("haptics_enabled")
            session.preferences.setDisableHaptics(false)
            toast.success("Haptics enabled successfully")
        },
        onError: (error: any) => {
            toast.error(error.name || error.message || "An error occurred")
        },
    })

    return mutation
}
