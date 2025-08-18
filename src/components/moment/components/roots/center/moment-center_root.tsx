import React from "react"
import { View } from "react-native"
import sizes from "../../../../../constants/sizes"
import { MomentCenterRootProps } from "../../../moment-types"

export default function center_root({ children }: MomentCenterRootProps) {
    const container: any = {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "flex-end",
        paddingHorizontal: sizes.paddings["1sm"],
    }

    return <View style={container}>{children}</View>
}
