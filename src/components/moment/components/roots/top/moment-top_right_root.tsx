import React from "react"
import { View } from "react-native"
import { MomentTopRightRootProps } from "../../../moment-types"

export default function top_right_root({ children }: MomentTopRightRootProps) {
    const container: any = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    }

    return <View style={container}>{children}</View>
}
