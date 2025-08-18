import React from "react"
import { View } from "react-native"
import sizes from "../../../../../constants/sizes"
import { MomentTopRootProps } from "../../../moment-types"

export default function top_root({ children }: MomentTopRootProps) {
    const container: any = {
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        padding: sizes.paddings["1sm"] / 2,
        paddingTop: sizes.paddings["1sm"] * 0.7,
    }

    return <View style={container}>{children}</View>
}
