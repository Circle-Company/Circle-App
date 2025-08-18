import React from "react"
import { View } from "react-native"
import ColorTheme from "../../../constants/colors"
type NotificationViewedProps = {
    viewed: boolean
}
export default function notification_viewed({ viewed }: NotificationViewedProps) {
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
