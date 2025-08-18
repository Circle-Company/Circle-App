import React from "react"
import { MoveDown, createNotifications } from "react-native-notificated"
import { Notify, Variant } from "react-native-notificated/lib/typescript/types"
import sizes from "../../constants/sizes"

import { Toast as AlertToast } from "./CustomToast/alert"
import { Toast as NotificationToast } from "./CustomToast/notification"
import { Toast as StandartToast } from "./CustomToast/standart"
import { Toast as TinyToast } from "./CustomToast/tiny"

type ToastProviderProps = { children: React.ReactNode }
export type ToastContextsData = {
    toast: Notify
}

type Variants = {
    toast: Variant<typeof StandartToast>
    tiny: Variant<typeof TinyToast>
    notification: Variant<typeof NotificationToast>
    alert: Variant<typeof AlertToast>
}

declare global {
    namespace Notificated {
        interface CustomVariants extends Variants {}
    }
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
            alert: {
                component: AlertToast,
                config: {
                    notificationPosition: "center",
                    duration: 3000,
                },
            },
        },
    })

    return <NotificationsProvider>{children}</NotificationsProvider>
}
export default ToastContext
