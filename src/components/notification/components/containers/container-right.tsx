import React from "react"
import { View } from "react-native"
import sizes from "../../../../constants/sizes"

type NotificationContainerProps = {
    children: React.ReactNode
}
export default function container_right({ children }: NotificationContainerProps) {
    const container: any = {
        height: sizes.headers.height * 0.9,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    }

    return <View style={container}>{children}</View>
}
