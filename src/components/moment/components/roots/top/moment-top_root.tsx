import { MomentTopRootProps } from "../../../moment-types"
import React from "react"
import { View } from "react-native"
import sizes from "../../../../../constants/sizes"

export default function top_root({ children }: MomentTopRootProps) {
    const container: any = {
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1sm"] * 1.1,
        paddingTop: sizes.paddings["1sm"] * 1.3,
    }

    return <View style={container}>{children}</View>
}
