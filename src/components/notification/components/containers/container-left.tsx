import { View } from "react-native"
import React from "react"
import sizes from "../../../../layout/constants/sizes"

type NotificationContainerProps = {
    children: React.ReactNode
}
export default function container_left({ children }: NotificationContainerProps) {
    const container: any = {
        height: sizes.headers.height * 0.9,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    }

    return <View style={container}>{children}</View>
}
