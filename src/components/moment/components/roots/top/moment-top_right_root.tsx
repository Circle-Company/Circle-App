import { View, ViewStyle } from "react-native"

import React from "react"
import sizes from "../../../../../constants/sizes"
import { MomentTopRightRootProps } from "../../../moment-types"

export default function top_right_root({ children }: MomentTopRightRootProps) {
    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginRight: sizes.margins["2sm"],
    }

    return <View style={container}>{children}</View>
}
