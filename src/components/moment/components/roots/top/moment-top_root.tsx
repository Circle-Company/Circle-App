import { MomentTopRootProps } from "../../../moment-types"
import React from "react"
import { View } from "react-native"
import sizes from "../../../../../layout/constants/sizes"

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
