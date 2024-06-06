import React from "react"
import { createNotifications, MoveUp, MoveDown} from 'react-native-notificated'
import { Notify} from "react-native-notificated/lib/typescript/types"
import { DefaultVariants} from "react-native-notificated/lib/typescript/defaultConfig/types"
import sizes from "../../layout/constants/sizes"
import { CustomToast as Toast } from "./CustomToast"

type ToastProviderProps = { children: React.ReactNode }
export type ToastContextsData = {
    toast: Notify<DefaultVariants>
}

const ToastContext = React.createContext<ToastContextsData>({} as ToastContextsData)

export function Provider({children}: ToastProviderProps) {
    const {NotificationsProvider} = createNotifications({
        notificationWidth: sizes.toasts.small.width,
        isNotch: false,
        animationConfig: MoveDown,
        variants: {
            toast: {
                component: Toast,
                config: {
                  notificationPosition: 'top',
                  duration: 1500,
                },
              },
        },
      })

    return (
        <NotificationsProvider>
                {children}    
        </NotificationsProvider>

    )
}
export default ToastContext