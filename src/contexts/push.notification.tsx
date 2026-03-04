import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { safeSet, storageKeys, storage } from "../store"
import { useSetPushTokenMutation, useInfiniteAccountNotificationsQuery } from "@/queries/account"

enum NotificationType {
    PROFILE_VIEW = "profile_view",
    MOMENT_LIKE = "moment_like",
    MOMENT_COMMENT = "moment_comment",
    FOLLOW = "follow",
}

export interface Notification {
    actorId: string
    text: string
    type: NotificationType
}
type PushNotificationContextValue = {
    permissionStatus: Notifications.PermissionStatus | null
    isGranted: boolean
    isDevice: boolean
    expoPushToken: string | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
    // Notifications (fetched via TanStack inside this context)
    notifications: any[]
    notificationsLoading: boolean
    notificationsRefreshing: boolean
    hasNextNotifications: boolean
    fetchNextNotifications: () => Promise<void> | void
    refetchNotifications: () => Promise<void> | void
}

const PushNotificationContext = createContext<PushNotificationContextValue | undefined>(undefined)

const keys = storageKeys()
export const EXPO_PUSH_TOKEN_KEY = keys.baseKey + "notifications:expopushtoken"
const getExpoDeviceId = (): string => {
    return (
        Device.osBuildId ??
        (Device as any).osInternalBuildId ??
        Device.modelId ??
        Device.deviceName ??
        "unknown"
    )
}

const syncPushToken = async (
    token: string | null | undefined,
    send: (input: { expoToken: string; deviceId: string }) => Promise<void>,
) => {
    try {
        if (!token) return
        // Require JWT to be present
        const jwt = storage.getString(keys.account.jwt.token)
        if (!jwt) return
        const deviceId = getExpoDeviceId()
        await send({ expoToken: token, deviceId })
    } catch {
        // noop - best effort
    }
}

export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(
        null,
    )
    const [isGranted, setIsGranted] = useState(false)
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
    const [isDevice, setIsDevice] = useState<boolean>(Device.isDevice ?? false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const setPushTokenMutation = useSetPushTokenMutation()

    const {
        data: notifData,
        isLoading: notifLoading,
        isFetchingNextPage: notifFetchingNext,
        fetchNextPage: fetchNextNotifPage,
        refetch: refetchNotif,
        isRefetching: notifRefreshing,
        hasNextPage: notifHasNext,
    } = useInfiniteAccountNotificationsQuery(20, {
        enabled: true,
        staleTime: 1000 * 30,
        refetchOnMount: true,
    })

    const notifications = useMemo(() => {
        const pages = (notifData?.pages as any[]) ?? []
        return pages.flatMap((p: any) => p?.notifications || p?.items || [])
    }, [notifData])

    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            // Check notification permission without prompting
            const perm = await Notifications.getPermissionsAsync()
            setPermissionStatus(perm.status)
            setIsGranted(perm.granted === true)

            // Persist permission flag (boolean) in storage
            safeSet(keys.permissions.postNotifications, perm.granted === true)

            // Only attempt to get push token when:
            // - running on a physical device
            // - permission is already granted
            if (!Device.isDevice) {
                setIsDevice(false)
                setExpoPushToken(null)
                safeSet(EXPO_PUSH_TOKEN_KEY, null)
                setLoading(false)
                return
            }

            setIsDevice(true)

            if (perm.granted) {
                // Try to fetch Expo push token
                // Note: In some setups you may need to pass a projectId into getExpoPushTokenAsync.
                // This implementation uses the default (no prompt, best-effort).
                const tokenResponse = await Notifications.getExpoPushTokenAsync()
                const token = tokenResponse.data

                setExpoPushToken(token ?? null)
                safeSet(EXPO_PUSH_TOKEN_KEY, token ?? null)
                await syncPushToken(token, (input) => setPushTokenMutation.mutateAsync(input))
            } else {
                // Permission not granted – ensure any stored token is cleared
                setExpoPushToken(null)
                safeSet(EXPO_PUSH_TOKEN_KEY, null)
            }
        } catch (e: any) {
            const message = typeof e?.message === "string" ? e.message : "Unknown error"
            setError(message)
            // Best-effort persist a safe state
            safeSet(keys.permissions.postNotifications, false)
            safeSet(EXPO_PUSH_TOKEN_KEY, null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Initial check on mount
        refresh()
    }, [refresh])

    const value = useMemo<PushNotificationContextValue>(
        () => ({
            permissionStatus,
            isGranted,
            isDevice,
            expoPushToken,
            loading,
            error,
            refresh,
            notifications,
            notificationsLoading: notifLoading,
            notificationsRefreshing: notifRefreshing,
            hasNextNotifications: !!notifHasNext,
            fetchNextNotifications: fetchNextNotifPage,
            refetchNotifications: refetchNotif,
        }),
        [
            permissionStatus,
            isGranted,
            isDevice,
            expoPushToken,
            loading,
            error,
            refresh,
            notifications,
            notifLoading,
            notifRefreshing,
            notifHasNext,
            fetchNextNotifPage,
            refetchNotif,
        ],
    )

    return (
        <PushNotificationContext.Provider value={value}>
            {children}
        </PushNotificationContext.Provider>
    )
}

export const usePushNotifications = (): PushNotificationContextValue => {
    const ctx = useContext(PushNotificationContext)
    if (!ctx) {
        throw new Error("usePushNotifications must be used within a PushNotificationProvider")
    }
    return ctx
}
