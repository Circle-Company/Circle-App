import React from "react"
import { View } from "react-native"
import { MemoryHeaderProps } from "../../memory-types"
import sizes from "../../../../layout/constants/sizes"
import ColorTheme from "../../../../layout/constants/colors"

export default function header ({children}: MemoryHeaderProps) {
    const container:any = {
        flexDirection: "row",
        alignItems: 'center',
        width: sizes.screens.width,
        paddingHorizontal: sizes.margins['3sm'],
        paddingVertical: sizes.paddings["1sm"]*0.8,
        borderTopWidth: 1,
        borderColor: ColorTheme().backgroundDisabled
    }
    
    return <View style={container}>{children}</View>
}