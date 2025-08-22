import { createContext, useContext } from "react"
import { NotificationProps } from "./notification-types"

const IndividualNotificationContext = createContext<{ notification: NotificationProps } | null>(
    null
)

export function useIndividualNotificationContext() {
    const context = useContext(IndividualNotificationContext)
    if (!context) {
        throw new Error(
            "Notification.* component must be rendered as child of Notification component"
        )
    }
    return context
}

export default IndividualNotificationContext
