import { MomentCenterRootProps } from "../../../moment-types"
import React from "react"
import { View } from "react-native"
import sizes from "../../../../../layout/constants/sizes"

export default function center_root({ children }: MomentCenterRootProps) {
    const container: any = {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "flex-end",
        paddingHorizontal: sizes.paddings["1sm"],
    }

    return <View style={container}>{children}</View>
}
