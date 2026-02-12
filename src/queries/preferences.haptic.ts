import { useMutation } from "@tanstack/react-query"
import React from "react"
import { useToast } from "@/contexts/Toast"
import PersistedContext from "@/contexts/Persisted"
import { apiRoutes } from "@/api"

export function useDisableHapticsMutation() {
    const { session } = React.useContext(PersistedContext)
    const toast = useToast()
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.content.setHaptics({
                userId: session.user.id,
                disableHaptics: true,
            })
        },
        onSuccess: () => {
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
                userId: session.user.id,
                disableHaptics: false,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableHaptics(false)
            toast.success("Haptics enabled successfully")
        },
        onError: (error: any) => {
            toast.error(error.name || error.message || "An error occurred")
        },
    })

    return mutation
}
