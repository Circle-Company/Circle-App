import { View, ViewStyle } from "react-native"

import { MomentTopRightRootProps } from "../../../moment-types"
import React from "react"
import sizes from "@/layout/constants/sizes"

export default function top_right_root({ children }: MomentTopRightRootProps) {
    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginRight: sizes.margins["2sm"],
    }

    return <View style={container}>{children}</View>
}
