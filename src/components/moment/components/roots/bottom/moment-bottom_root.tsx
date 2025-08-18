import React from "react"
import { View } from "react-native"
import sizes from "../../../../../constants/sizes"
import { MomentBottomRootProps } from "../../../moment-types"

export default function bottom_root({ children }: MomentBottomRootProps) {
    const container: any = {
        width: "100%",
        padding: sizes.paddings["1sm"] / 2,
    }

    return <View style={container}>{children}</View>
}
