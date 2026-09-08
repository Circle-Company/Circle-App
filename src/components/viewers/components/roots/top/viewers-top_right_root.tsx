import React from "react"
import { View } from "react-native"
import { ViewersTopRightRootProps } from "../../../viewers-types"

export default function top_right_root({ children }: ViewersTopRightRootProps) {
    const container: any = {
        alignItems: "flex-end",
        justifyContent: "center",
    }

    return <View style={container}>{children}</View>
}
