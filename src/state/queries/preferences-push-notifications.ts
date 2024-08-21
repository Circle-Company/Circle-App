import PersistedContext from "@/contexts/Persisted"
import { useMutation } from "@tanstack/react-query"
import React from "react"
import { apiRoutes } from "../../services/Api"

export function useDisableLikeMomentMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setLikeMoment({
                userId: session.user.id,
                disableLikeMoment: true,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableLikeMoment(true)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useEnableLikeMomentMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setLikeMoment({
                userId: session.user.id,
                disableLikeMoment: false,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableLikeMoment(false)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useDisableNewMemoryMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setNewMemory({
                userId: session.user.id,
                disableNewMemory: true,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableNewMemory(true)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useEnableNewMemoryMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setNewMemory({
                userId: session.user.id,
                disableNewMemory: false,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableNewMemory(false)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useDisableAddToMemoryMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setAddToMemory({
                userId: session.user.id,
                disableAddToMemory: true,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableAddToMemory(true)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useEnableAddToMemoryMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setAddToMemory({
                userId: session.user.id,
                disableAddToMemory: false,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableAddToMemory(false)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useDisableFollowUserMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setFollowUser({
                userId: session.user.id,
                disableFollowUser: true,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableFollowUser(true)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useEnableFollowUserMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setFollowUser({
                userId: session.user.id,
                disableFollowUser: false,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableFollowUser(false)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useDisableViewUserMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setViewUser({
                userId: session.user.id,
                disableViewUser: true,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableViewUser(true)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}

export function useEnableViewUserMutation() {
    const { session } = React.useContext(PersistedContext)
    const mutation = useMutation({
        mutationFn: async () => {
            await apiRoutes.preferences.pushNotification.setViewUser({
                userId: session.user.id,
                disableViewUser: false,
            })
        },
        onSuccess: () => {
            session.preferences.setDisableViewUser(false)
        },
        onError: (err: any) => {
            console.log(err)
        },
    })

    return mutation
}