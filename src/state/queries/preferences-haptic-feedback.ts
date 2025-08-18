import { useMutation } from "@tanstack/react-query"
import React from "react"
import { notify } from "react-native-notificated"
import PersistedContext from "../../contexts/Persisted"
import { apiRoutes } from "../../services/Api"

export function useDisableHapticsMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.content.setHaptics({
                userId: session.user.id,
                disableHaptics: true,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableHaptics(true)
        },
    })

    if (mutation.isError) {
        notify("alert", {
            params: {
                message: mutation.error.name,
            },
        })
    }

    return mutation
}

export function useEnableEnableMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.content.setHaptics({
                userId: session.user.id,
                disableHaptics: false,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableHaptics(false)
        },
    })

    if (mutation.isError) {
        notify("alert", {
            params: {
                message: mutation.error.name,
            },
        })
    }

    return mutation
}
