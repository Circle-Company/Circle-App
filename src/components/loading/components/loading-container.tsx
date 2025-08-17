import React from "react"
import { View } from "react-native"
import sizes from "../../../layout/constants/sizes"
import { LoadingContainerProps } from "../loading-types"

export default function container({
    width = sizes.screens.width,
    height = sizes.screens.height,
    children,
}: LoadingContainerProps) {
    const container: any = {
        alignItems: "center",
        justifyContent: "center",
        width: width,
        height: height,
    }

    return <View style={container}>{children}</View>
}
