import React from "react"
import { View } from "react-native"
import sizes from "../../../../constants/sizes"
import { MemoryHeaderProps } from "../../memory-types"

export default function header({ children }: MemoryHeaderProps) {
    const container: any = {
        flexDirection: "row",
        alignItems: "center",
        width: sizes.screens.width,
        paddingHorizontal: sizes.margins["3sm"],
        paddingVertical: sizes.paddings["1sm"] * 0.8,
    }

    return <View style={container}>{children}</View>
}
