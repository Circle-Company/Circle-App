import { storage, storageKeys } from "../store"

import { getApp } from "@react-native-firebase/app"
import {
    AuthorizationStatus,
    getMessaging,
    getToken,
    onMessage,
    onTokenRefresh,
    requestPermission,
    setBackgroundMessageHandler,
} from "@react-native-firebase/messaging"

import React from "react"
import { notify } from "react-native-notificated"
import { Vibrate } from "../lib/hooks/useHapticFeedback"
import { useRequestPermission } from "../lib/hooks/userRequestPermissions"
import { notification } from "../lib/notifications"
import PersistedContext from "./Persisted"

type NotificationProviderProps = { children: React.ReactNode }
export type NotificationContextData = {}

const NotificationContext = React.createContext<NotificationContextData>(
    {} as NotificationContextData,
)

export function Provider({ children }: NotificationProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [enableRequestToken, setEnableRequestToken] = React.useState(false)

    const messagingInstance = React.useMemo(() => getMessaging(getApp()), [])

    async function requestUserPermission() {
        console.log("requestUserPermission")
        if (session?.user?.id && session?.account?.jwtToken) {
            useRequestPermission.postNotifications()
            const status: number = await requestPermission(messagingInstance)
            const enabled =
                status === AuthorizationStatus.AUTHORIZED ||
                status === AuthorizationStatus.PROVISIONAL
            setEnableRequestToken(enabled)
        }
    }

    async function refreshToken() {
        console.log("refreshToken")
        if (session?.user?.id && session?.account?.jwtToken) {
            const token = await getToken(messagingInstance)
            if (typeof token === "string" && token !== "") {
                notification.registerPushToken({
                    userId: Number(storage.getNumber(storageKeys().user.id)),
                    token,
                })
            }
        }
    }

    React.useEffect(() => {
        async function fetch() {
            if (session?.user?.id && session?.account?.jwtToken) {
                await requestUserPermission()
                await refreshToken()
            }
        }
        fetch()
    }, [session?.user?.id, session?.account?.jwtToken])

    React.useEffect(() => {
        const unsubscribeTokenRefresh = onTokenRefresh(messagingInstance, (token) => {
            console.log("onTokenRefresh")
            if (enableRequestToken) {
                setTimeout(() => {
                    if (typeof token === "string" && token !== "") {
                        notification.registerPushToken({
                            userId: Number(storage.getNumber(storageKeys().user.id)),
                            token,
                        })
                    }
                }, 10000)
            }
        })

        const unsubscribeOnMessage = onMessage(messagingInstance, async (remoteMessage) => {
            console.log("onMessage")
            if (
                session?.account?.unreadNotificationsCount !== undefined &&
                session?.account?.setUnreadNotificationsCount
            ) {
                const previousNotificationsNum = session.account.unreadNotificationsCount
                session.account.setUnreadNotificationsCount(previousNotificationsNum + 1)
            }
            Vibrate("effectClick")

            notify("notification", {
                params: {
                    title: remoteMessage.notification?.title || "",
                    description: remoteMessage.notification?.body || "",
                },
            })
        })

        setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
            if (
                session?.account?.unreadNotificationsCount !== undefined &&
                session?.account?.setUnreadNotificationsCount
            ) {
                const previousNotificationsNum = session.account.unreadNotificationsCount
                session.account.setUnreadNotificationsCount(previousNotificationsNum + 1)
            }
            Vibrate("effectClick")
            /*
      notify("notification", {
        params: {
          title: remoteMessage.notification?.title,
          description: remoteMessage.notification?.body,
        },
      });
      */
        })

        return () => {
            unsubscribeTokenRefresh()
            unsubscribeOnMessage()
        }
    }, [enableRequestToken, messagingInstance, session])

    return <NotificationContext.Provider value={{}}>{children}</NotificationContext.Provider>
}

export default NotificationContext
