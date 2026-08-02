import React from "react"
import { View } from "react-native"
import { MomentTopLeftRootProps } from "../../../moment-types"
import { ViewStyle } from "react-native"
import sizes from "@/constants/sizes"

export default function top_left_root({ children }: MomentTopLeftRootProps) {
    const container: ViewStyle = {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginLeft: sizes.margins["1sm"],
    }

    return <View style={container}>{children}</View>
}
