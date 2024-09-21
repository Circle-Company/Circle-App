import messaging from "@react-native-firebase/messaging"
import React from "react"
import { notify } from "react-native-notificated"
import { Vibrate } from "../lib/hooks/useHapticFeedback"
import { useRequestPermission } from "../lib/hooks/userRequestPermissions"
import { notification } from "../lib/notifications"
import PersistedContext from "./Persisted"
import LanguageContext from "./Preferences/language"

type NotificationProviderProps = { children: React.ReactNode }
export type NotificationContextData = {}

const NotificationContext = React.createContext<NotificationContextData>(
    {} as NotificationContextData
)

export function Provider({ children }: NotificationProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    React.useEffect(() => {
        async function requestUserPermission() {
            useRequestPermission.postNotifications()
            const status: number = await messaging().requestPermission()
            const enabled =
                status === messaging.AuthorizationStatus.AUTHORIZED ||
                status === messaging.AuthorizationStatus.PROVISIONAL
            if (enabled) {
                let token = await messaging().getToken()
                session.account.setFirebasePushToken(token.toString())
                notification.registerPushToken({ userId: session.user.id, token })
            }
        }
        requestUserPermission()
    }, [])

    React.useEffect(() => {
        async function refreshToken() {
            let token = await messaging().getToken()
            session.account.setFirebasePushToken(token.toString())
            notification.registerPushToken({
                userId: Number(storage.getNumber(storageKeys().user.id)),
                token,
            })
        }
        refreshToken()
    }, [])

    messaging().onTokenRefresh((token) => {
        setTimeout(() => {
            notification.refreshPushToken(token)
            notification.registerPushToken({ userId: session.user.id, token })
        }, 10000)
    })

    messaging().onMessage(async (remoteMessage) => {
        const previousNotificationsNum = session.account.unreadNotificationsCount
        session.account.setUnreadNotificationsCount(previousNotificationsNum + 1)
        Vibrate("effectClick")

        notify("notification", {
            params: {
                title: remoteMessage.notification?.title,
                description: remoteMessage.notification?.body,
            },
        })
    })

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        const previousNotificationsNum = session.account.unreadNotificationsCount
        session.account.setUnreadNotificationsCount(previousNotificationsNum + 1)
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
