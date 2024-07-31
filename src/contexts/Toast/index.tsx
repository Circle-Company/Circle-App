import React from "react"
import { MoveDown, createNotifications } from "react-native-notificated"
import { DefaultVariants } from "react-native-notificated/lib/typescript/defaultConfig/types"
import { Notify } from "react-native-notificated/lib/typescript/types"
import sizes from "../../layout/constants/sizes"
import { Toast as NotificationToast } from "./CustomToast/notification"
import { Toast as StandartToast } from "./CustomToast/standart"
import { Toast as TinyToast } from "./CustomToast/tiny"
type ToastProviderProps = { children: React.ReactNode }
export type ToastContextsData = {
    toast: Notify<DefaultVariants>
}

const ToastContext = React.createContext<ToastContextsData>({} as ToastContextsData)

export function Provider({ children }: ToastProviderProps) {
    const { NotificationsProvider } = createNotifications({
        notificationWidth: sizes.toasts.small.width,
        isNotch: false,
        animationConfig: MoveDown,
        variants: {
            toast: {
                component: StandartToast,
                config: {
                    notificationPosition: "top",
                    duration: 1500,
                },
            },
            tiny: {
                component: TinyToast,
                config: {
                    notificationPosition: "top",
                    duration: 1000,
                },
            },
            notification: {
                component: NotificationToast,
                config: {
                    notificationPosition: "top",
                    duration: 1000,
                },
            },
        },
    })

    return <NotificationsProvider>{children}</NotificationsProvider>
}
export default ToastContext
