import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { safeSet, storageKeys, storage } from "../store"
import {
    useSetPushTokenMutation,
    useAccountNotificationsQuery,
    type AccountNotification,
    type FetchAccountNotificationsParams,
} from "@/queries/account"

export enum NotificationType {
    HexEntry = "HEX_ENTRY",
    UserFollowed = "USER_FOLLOWED",
    ProfileViewed = "PROFILE_VIEW",
    MomentCommented = "MOMENT_COMMENTED",
    MomentLiked = "MOMENT_LIKED",
}

export type NotificationPayload = {
    id: string
    actor: {
        id: string
        name: string
        username: string
        //verified: boolean
        profilePicture: string
    }
    type: NotificationType
    text?: string
    createdAt?: string
    readAt?: string | null
}

export type Notification = AccountNotification
type PushNotificationContextValue = {
    permissionStatus: Notifications.PermissionStatus | null
    isGranted: boolean
    isDevice: boolean
    expoPushToken: string | null
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
    // Notifications (fetched via TanStack inside this context)
    notifications: AccountNotification[]
    unreadCount: number
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

    const [queryParams, setQueryParams] = useState<FetchAccountNotificationsParams>({
        limit: 20,
        read: "all",
    })
    const [items, setItems] = useState<AccountNotification[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const {
        data: notifData,
        isLoading: notifLoading,
        refetch: refetchNotif,
        isRefetching: notifRefetching,
    } = useAccountNotificationsQuery(queryParams, {
        enabled: true,
        staleTime: 1000 * 30,
        refetchOnMount: true,
    })

    useEffect(() => {
        const incoming = notifData?.notifications ?? []
        const isPaging =
            (queryParams.cursor != null && queryParams.cursor !== "") ||
            (typeof queryParams.offset === "number" && queryParams.offset > 0)

        if (!isPaging) {
            setItems(incoming)
            return
        }

        if (incoming.length === 0) return

        setItems((prev) => {
            const seen = new Set(prev.map((n) => String(n.id)))
            const add = incoming.filter((n) => !seen.has(String(n.id)))
            return [...prev, ...add]
        })
    }, [notifData?.notifications, queryParams.cursor, queryParams.offset])

    const notifications = useMemo<AccountNotification[]>(() => items, [items])

    const unreadCount = useMemo<number>(
        () => notifications.reduce((acc, n: any) => (n.read ? acc : acc + 1), 0),
        [notifications],
    )

    const hasNextNotifications = useMemo(() => {
        const nextCursor = notifData?.pagination?.nextCursor
        if (nextCursor != null && nextCursor !== "") return true
        const total = notifData?.pagination?.total
        if (typeof total === "number") return notifications.length < total
        return true
    }, [notifData?.pagination?.nextCursor, notifData?.pagination?.total, notifications.length])

    const getNextParams = useCallback((): FetchAccountNotificationsParams => {
        const limit = queryParams.limit ?? 20
        const nextCursor = notifData?.pagination?.nextCursor
        if (nextCursor != null && nextCursor !== "") {
            return {
                ...queryParams,
                cursor: nextCursor,
                offset: undefined,
            }
        }
        const nextOffset =
            typeof queryParams.offset === "number"
                ? queryParams.offset + limit
                : notifications.length
        return {
            ...queryParams,
            offset: nextOffset,
        }
    }, [notifData?.pagination?.nextCursor, notifications.length, queryParams])

    const refreshNotifications = useCallback(async () => {
        setIsRefreshing(true)
        try {
            setItems([])
            setQueryParams((prev) => ({
                ...prev,
                offset: 0,
                cursor: null,
            }))
            await refetchNotif()
        } finally {
            setIsRefreshing(false)
        }
    }, [refetchNotif])

    const fetchNextNotifications = useCallback(async () => {
        if (isLoadingMore || !hasNextNotifications) return
        setIsLoadingMore(true)
        try {
            const nextParams = getNextParams()
            setQueryParams(nextParams)
        } finally {
            setIsLoadingMore(false)
        }
    }, [getNextParams, hasNextNotifications, isLoadingMore])

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
            unreadCount,
            notificationsLoading: notifLoading,
            notificationsRefreshing: isRefreshing || notifRefetching,
            hasNextNotifications,
            fetchNextNotifications,
            refetchNotifications: refreshNotifications,
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
            unreadCount,
            notifLoading,
            isRefreshing,
            notifRefetching,
            hasNextNotifications,
            fetchNextNotifications,
            refreshNotifications,
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
