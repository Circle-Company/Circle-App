import React from "react"
import { GLobalToast } from "../components/notification/global-toast"
import { NotificationProps } from "../components/notification/notification-types"

type NotificationProviderProps = { children: React.ReactNode }
export type NotificationContextData = {
    lastNotification: NotificationProps
    newNotificationsNum: number
    allNotifications: NotificationProps[]
    showNotification: boolean
    setReadSocketNotifications(): void
}
const NotificationContext = React.createContext<NotificationContextData>(
    {} as NotificationContextData
)

export function Provider({ children }: NotificationProviderProps) {
    const [socketNotifications, setSocketNotifications] = React.useState<NotificationProps[]>([])
    const [newNotificationsNum, setNewNotificationsNum] = React.useState<number>(0)
    const [lastNotification, setLastNotification] = React.useState<NotificationProps | any>({})
    const [notifications, setNotifications] = React.useState([])
    const [allNotifications, setAllNotifications] = React.useState<any[]>([])
    const [showNotification, setShowNotification] = React.useState<boolean>(false)

    /**
     *     React.useEffect(() => {
        socket.on("new-notification", (notification: any) => {
            setSocketNotifications((prev: any):any => [...prev, notification]);
            setLastNotification(notification)
            setShowNotification(false)
            setShowNotification(true)
        })
    }, [socket])
     */

    React.useEffect(() => {
        //setNewNotificationsNum(socketNotifications.length)
        if (!lastNotification)
            setLastNotification(socketNotifications[socketNotifications.length - 1])
        //setAllNotifications([...socketNotifications, ...notifications])
        setAllNotifications([...notifications])
    }, [socketNotifications, notifications])

    const setReadSocketNotifications = () => {
        //setNewNotificationsNum(0)
        //setSocketNotifications([])
        setLastNotification({})
    }

    return (
        <NotificationContext.Provider
            value={{
                newNotificationsNum,
                allNotifications,
                lastNotification,
                setReadSocketNotifications,
                showNotification,
            }}
        >
            <GLobalToast showNotification={showNotification} lastNotification={lastNotification} />
            {children}
        </NotificationContext.Provider>
    )
}
export default NotificationContext
