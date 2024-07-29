import messaging from "@react-native-firebase/messaging"
import React from "react"
import { Alert } from "react-native"
import { notification } from "../lib/notifications"
import PersistedContext from "./Persisted"
type NotificationProviderProps = { children: React.ReactNode }
export type NotificationContextData = {}

const NotificationContext = React.createContext<NotificationContextData>(
    {} as NotificationContextData
)

export function Provider({ children }: NotificationProviderProps) {
    const { session } = React.useContext(PersistedContext)
    React.useEffect(() => {
        async function get() {
            let token = await messaging().getToken()
            session.account.setFirebasePushToken(token.toString())
            notification.registerPushToken({ userId: session.user.id, token })
        }
        get()
    }, [])

    messaging().onTokenRefresh((token) => {
        notification.refreshPushToken(token)
        notification.registerPushToken({ userId: session.user.id, token })
    })

    messaging().onMessage(async (remoteMessage) => {
        Alert.alert("New message recieved", JSON.stringify(remoteMessage))
    })

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        Alert.alert("New message recieved", JSON.stringify(remoteMessage))
    })
    return <NotificationContext.Provider value={{}}>{children}</NotificationContext.Provider>
}
export default NotificationContext
