import React from "react"
import { View } from "react-native"
import sizes from "../../../../constants/sizes"
import IndividualNotificationContext from "../../../notification/notification-individual_context"
import { NotificationProps } from "../../../notification/notification-types"

type NotificationContainerProps = {
    children: React.ReactNode
    notification: NotificationProps
}
export default function container_main({ children, notification }: NotificationContainerProps) {
    const container: any = {
        width: sizes.screens.width,
        minHeight: sizes.headers.height * 0.9,
        maxHeight: sizes.headers.height * 1.8,
        paddingHorizontal: sizes.paddings["2sm"],
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    }

    return (
        <IndividualNotificationContext.Provider value={{ notification: notification }}>
            <View style={container}>{children}</View>
        </IndividualNotificationContext.Provider>
    )
}
