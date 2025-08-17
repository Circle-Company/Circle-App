import { View } from "react-native"
import ColorTheme from "../../../layout/constants/colors"
import { useIndividualNotificationContext } from "../notification-individual_context"
import React from "react"
type NotificationViewedProps = {
    viewed: boolean
}
export default function notification_viewed({ viewed }: NotificationViewedProps) {
    const { notification } = useIndividualNotificationContext()
    const container: any = {
        width: 5,
        height: 16,
        borderRadius: 2.5,
        left: -5,
        backgroundColor: String(ColorTheme().view),
    }

    if (!viewed) {
        return <View style={container} />
    } else return null
}
