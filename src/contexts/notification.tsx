import messaging from "@react-native-firebase/messaging"
import React from "react"
import { notify } from "react-native-notificated"
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

    messaging().onTokenRefresh((token) => {
        notification.refreshPushToken(token)
        notification.registerPushToken({ userId: session.user.id, token })
    })

    messaging().onMessage(async (remoteMessage) => {
        notify("notification", {
            params: {
                title: remoteMessage.notification?.title,
                description: remoteMessage.notification?.body,
            },
        })
    })

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        notify("notification", {
            params: {
                title: remoteMessage.notification?.title,
                description: remoteMessage.notification?.body,
            },
        })
    })
    return <NotificationContext.Provider value={{}}>{children}</NotificationContext.Provider>
}
export default NotificationContext
