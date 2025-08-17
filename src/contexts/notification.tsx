import { storage, storageKeys } from "../store"

import PersistedContext from "./Persisted"
import React from "react"
import { Vibrate } from "../lib/hooks/useHapticFeedback"
import messaging from "@react-native-firebase/messaging"
import { notification } from "../lib/notifications"
import { notify } from "react-native-notificated"
import { useRequestPermission } from "../lib/hooks/userRequestPermissions"

type NotificationProviderProps = { children: React.ReactNode }
export type NotificationContextData = {}

const NotificationContext = React.createContext<NotificationContextData>(
    {} as NotificationContextData
)

export function Provider({ children }: NotificationProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [enableRequestToken, setEnableRequestToken] = React.useState(false)

    async function requestUserPermission() {
        console.log("requestUserPermission")
        if (session?.user?.id && session?.account?.jwtToken) {
            useRequestPermission.postNotifications()
            const status: number = await messaging().requestPermission()
            const enabled =
                status === messaging.AuthorizationStatus.AUTHORIZED ||
                status === messaging.AuthorizationStatus.PROVISIONAL
            setEnableRequestToken(enabled)
        }
    }

    async function refreshToken() {
        console.log("refreshToken")
        if (session?.user?.id && session?.account?.jwtToken) {
            const token = await messaging().getToken()
            if (typeof token == "string" && token !== "") {
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

    messaging().onTokenRefresh((token) => {
        console.log("messaging().onTokenRefresh")
        if (enableRequestToken) {
            setTimeout(() => {
                if (typeof token == "string" && token !== "") {
                    notification.registerPushToken({
                        userId: Number(storage.getNumber(storageKeys().user.id)),
                        token,
                    })
                }
            }, 10000)
        }
    })

    messaging().onMessage(async (remoteMessage) => {
        console.log("messaging().onMessage")
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

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        if (
            session?.account?.unreadNotificationsCount !== undefined &&
            session?.account?.setUnreadNotificationsCount
        ) {
            const previousNotificationsNum = session.account.unreadNotificationsCount
            session.account.setUnreadNotificationsCount(previousNotificationsNum + 1)
        }
        Vibrate("effectClick")
        /** 
        notify("notification", {
            params: {
                title: remoteMessage.notification?.title,
                description: remoteMessage.notification?.body,
            },
        })*/
    })
    return <NotificationContext.Provider value={{}}>{children}</NotificationContext.Provider>
}
export default NotificationContext
