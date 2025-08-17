import React from "react"
import { View } from "react-native"
import sizes from "../../../../layout/constants/sizes"

type NotificationContainerProps = {
    children: React.ReactNode
}
export default function container_center({ children }: NotificationContainerProps) {
    const container: any = {
        flex: 1,
        paddingHorizontal: sizes.paddings["1sm"],
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
    }

    return <View style={container}>{children}</View>
}
