import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import { usePathname } from "expo-router"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { useToast } from "@/contexts/Toast"

import { safeSet, storageKeys, storage } from "../store"
import {
    useSetPushTokenMutation,
    useReadAllNotificationsMutation,
    useAccountNotificationsQuery,
    type AccountNotification,
    type FetchAccountNotificationsParams,
} from "@/queries/account"

// ──────────────────────────────────────────────────────────────────────────────
// Foreground notification behaviour (per Expo docs)
// Must be called at module scope, before any listener is registered.
// ──────────────────────────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: false, // we show our own in-app toast
        shouldShowList: true, // keep in notification center
        shouldPlaySound: true, // let the OS play the push sound
        shouldSetBadge: false, // we control the badge ourselves
    }),
})

// ──────────────────────────────────────────────────────────────────────────────
// Types & enums
// ──────────────────────────────────────────────────────────────────────────────
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
        profilePicture: string
    }
    title: string
    description: string
    type: NotificationType
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
    notifications: NotificationPayload[]
    unreadCount: number
    notificationsLoading: boolean
    notificationsRefreshing: boolean
    hasNextNotifications: boolean
    fetchNextNotifications: () => Promise<void> | void
    refetchNotifications: () => Promise<void> | void
    resetUnread: () => void
    markAllRead: () => void
    inboxVisited: boolean
}

const PushNotificationContext = createContext<PushNotificationContextValue | undefined>(undefined)

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
const keys = storageKeys()
export const EXPO_PUSH_TOKEN_KEY = keys.baseKey + "notifications:expopushtoken"

const getExpoDeviceId = (): string =>
    Device.osBuildId ??
    (Device as any).osInternalBuildId ??
    Device.modelId ??
    Device.deviceName ??
    "unknown"

const syncPushToken = async (
    token: string | null | undefined,
    send: (input: { expoToken: string; deviceId: string }) => Promise<void>,
) => {
    try {
        if (!token) return
        const jwt = storage.getString(keys.account.jwt.token)
        if (!jwt) return
        const deviceId = getExpoDeviceId()
        await send({ expoToken: token, deviceId })
    } catch {
        // best-effort
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────────────────────────────────
export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ── Toast (via ref so the listener closure never goes stale) ──
    const toast = useToast()
    const toastRef = useRef(toast)
    useEffect(() => {
        toastRef.current = toast
    }, [toast])

    // ── Permission / token state ──
    const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(
        null,
    )
    const [isGranted, setIsGranted] = useState(false)
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
    const [isDevice, setIsDevice] = useState<boolean>(Device.isDevice ?? false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const setPushTokenMutation = useSetPushTokenMutation()
    const readAllMutation = useReadAllNotificationsMutation()
    const lastSyncedToken = useRef<string | null>(null)
    const forcedSyncOnce = useRef(false)
    const syncInFlight = useRef<Promise<void> | null>(null)

    const persistExpoToken = useCallback((token: string | null) => {
        setExpoPushToken(token)
        safeSet(EXPO_PUSH_TOKEN_KEY, token ?? null)
        if (!token) lastSyncedToken.current = null
    }, [])

    const syncTokenOnce = useCallback(
        async (token: string | null, force = false) => {
            if (!token) return
            if (!force && token === lastSyncedToken.current) return
            if (syncInFlight.current) {
                await syncInFlight.current
                return
            }
            const task = (async () => {
                await syncPushToken(token, (input) => setPushTokenMutation.mutateAsync(input))
            })()
            syncInFlight.current = task
            try {
                await task
                lastSyncedToken.current = token
            } finally {
                syncInFlight.current = null
            }
        },
        [setPushTokenMutation],
    )

    // ── Notification list state ──
    const [queryParams, setQueryParams] = useState<FetchAccountNotificationsParams>({
        limit: 20,
        read: "all",
    })
    const [items, setItems] = useState<NotificationPayload[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [unreadBoost, setUnreadBoost] = useState(0)
    const [inboxVisited, setInboxVisited] = useState(false)

    // ── Route-based inbox detection ──
    const pathname = usePathname()
    const isOnInbox = pathname === "/(tabs)/inbox"
    const isOnInboxRef = useRef(isOnInbox)
    useEffect(() => {
        isOnInboxRef.current = isOnInbox
    }, [isOnInbox])

    // Marca como visitado apenas quando o usuário realmente navega para a inbox
    const prevIsOnInbox = useRef(isOnInbox)
    useEffect(() => {
        if (isOnInbox) {
            if (!inboxVisited) setInboxVisited(true)
            setUnreadBoost(0)
            Notifications.setBadgeCountAsync(0)
            // Mark all as read on the backend
            readAllMutation.mutate()
        }
        Notifications.setBadgeCountAsync(unreadCount)
        prevIsOnInbox.current = isOnInbox
    }, [isOnInbox, inboxVisited])

    useEffect(() => {
        if (!prevIsOnInbox.current && isOnInbox && !inboxVisited) {
            setInboxVisited(true)
            setUnreadBoost(0)
            Notifications.setBadgeCountAsync(0)
            // Mark all as read on the backend
            readAllMutation.mutate()
        }
        prevIsOnInbox.current = isOnInbox
    }, [isOnInbox, inboxVisited])

    // ── React-Query for notifications ──
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
            if (incoming.length === 0 && (notifRefetching || notifLoading)) return
            setItems(incoming as any)
            setUnreadBoost(0)
            return
        }

        if (incoming.length === 0) return

        setItems((prev) => {
            const seen = new Set(prev.map((n) => String(n.id)))
            const add = incoming.filter((n) => !seen.has(String(n.id)))
            return [...prev, ...add]
        })
        setUnreadBoost(0)
    }, [
        notifData?.notifications,
        notifRefetching,
        notifLoading,
        queryParams.cursor,
        queryParams.offset,
    ])

    const notifications = useMemo<NotificationPayload[]>(() => items, [items])

    // Badge count = only the NEW notifications since the user last visited inbox
    const unreadCount = useMemo<number>(() => {
        if (inboxVisited) return 0
        return unreadBoost
    }, [unreadBoost, inboxVisited])

    const resetUnread = useCallback(() => {
        setUnreadBoost(0)
        setInboxVisited(true)
        Notifications.setBadgeCountAsync(0)
    }, [])

    // Mark all notifications as read on the backend and refetch
    const markAllRead = useCallback(() => {
        readAllMutation.mutate(undefined, {
            onSuccess: () => {
                refreshNotificationsRef.current()
            },
        })
    }, [readAllMutation])

    // Sync OS badge whenever unreadCount changes
    useEffect(() => {
        if (!isGranted) return
        Notifications.setBadgeCountAsync(unreadCount)
    }, [isGranted, unreadCount])

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
            return { ...queryParams, cursor: nextCursor, offset: undefined }
        }
        const nextOffset =
            typeof queryParams.offset === "number"
                ? queryParams.offset + limit
                : notifications.length
        return { ...queryParams, offset: nextOffset }
    }, [notifData?.pagination?.nextCursor, notifications.length, queryParams])

    const refreshNotifications = useCallback(async () => {
        setIsRefreshing(true)
        try {
            const hasCursor = queryParams.cursor != null && queryParams.cursor !== ""
            const hasOffset = typeof queryParams.offset === "number" && queryParams.offset > 0

            if (hasCursor || hasOffset) {
                setQueryParams((prev) => ({ ...prev, offset: 0, cursor: null }))
                return
            }
            await refetchNotif()
        } finally {
            setIsRefreshing(false)
        }
    }, [queryParams.cursor, queryParams.offset, refetchNotif])

    // Stable ref so listener closure is never stale
    const refreshNotificationsRef = useRef(refreshNotifications)
    useEffect(() => {
        refreshNotificationsRef.current = refreshNotifications
    }, [refreshNotifications])

    // ──────────────────────────────────────────────────────────────────────────
    // Notification event listeners (per Expo docs)
    // ──────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        // Fires when a notification is received while the app is FOREGROUNDED
        const receivedSubscription = Notifications.addNotificationReceivedListener((event) => {
            // Mark that new unread content exists
            setInboxVisited(false)

            // Haptic feedback
            Vibrate("notificationSuccess")

            // Always refetch the notification list from backend
            refreshNotificationsRef.current()

            if (isOnInboxRef.current) {
                // User is on inbox — just refresh, keep badge at 0
                setUnreadBoost(0)
                Notifications.setBadgeCountAsync(0)
            } else {
                // User is NOT on inbox — increment badge & show full notification toast
                setUnreadBoost((prev) => prev + 1)

                const rawData = event.request.content.data as Record<string, any> | undefined
                const title = event.request.content.title ?? ""
                const body = event.request.content.body ?? ""

                // Build a full NotificationPayload for the toast
                const payload: NotificationPayload = {
                    id: rawData?.id ?? event.request.identifier ?? Date.now().toString(),
                    actor: rawData?.actor ?? {
                        id: rawData?.actorId ?? "",
                        name: rawData?.actorName ?? title ?? "",
                        username: rawData?.actorUsername ?? "",
                        profilePicture: rawData?.actorProfilePicture ?? "",
                    },
                    title: rawData?.title ?? title ?? "",
                    description: rawData?.description ?? body ?? "",
                    type: rawData?.type ?? NotificationType.HexEntry,
                    createdAt: rawData?.createdAt ?? new Date().toISOString(),
                    readAt: null,
                }

                toastRef.current.show({
                    type: "notification",
                    notificationPayload: payload,
                    duration: 4000,
                })
            }
        })

        // Fires when the user TAPS on a notification (app was bg or closed)
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(
            (_response) => {
                // Refetch the list so the inbox is up-to-date when the user opens it
                refreshNotificationsRef.current()
            },
        )

        return () => {
            receivedSubscription.remove()
            responseSubscription.remove()
        }
    }, [])

    // ── Pagination ──
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

    // ── Permission check & token registration ──
    const refresh = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const perm = await Notifications.getPermissionsAsync()
            setPermissionStatus(perm.status)
            setIsGranted(perm.granted === true)
            safeSet(keys.permissions.postNotifications, perm.granted === true)

            if (!Device.isDevice) {
                setIsDevice(false)
                persistExpoToken(null)
                setLoading(false)
                return
            }

            setIsDevice(true)

            if (perm.granted) {
                const tokenResponse = await Notifications.getExpoPushTokenAsync()
                const token = tokenResponse.data
                persistExpoToken(token ?? null)
                const shouldForce = !forcedSyncOnce.current
                await syncTokenOnce(token ?? null, shouldForce)
                forcedSyncOnce.current = true
            } else {
                persistExpoToken(null)
            }
        } catch (e: any) {
            const message = typeof e?.message === "string" ? e.message : "Unknown error"
            setError(message)
            safeSet(keys.permissions.postNotifications, false)
            safeSet(EXPO_PUSH_TOKEN_KEY, null)
        } finally {
            setLoading(false)
        }
    }, [persistExpoToken, syncTokenOnce])

    // Initial check on mount
    useEffect(() => {
        refresh()
    }, [refresh])

    // ── Context value ──
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
            resetUnread,
            markAllRead,
            inboxVisited,
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
            resetUnread,
            markAllRead,
            inboxVisited,
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
