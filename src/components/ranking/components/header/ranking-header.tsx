import React from "react"
import { View, Text } from "react-native"
import { RankingHeaderProps } from "../../ranking-types"
import sizes from "../../../../layout/constants/sizes"

export default function header ({children}: RankingHeaderProps) {
    const container:any = {
        flexDirection: "row",
        alignItems: 'center',
        width: sizes.screens.width,
        paddingHorizontal: sizes.margins['3sm'],
        paddingVertical: sizes.paddings["1sm"]*0.8,
    }
    
    return (
        <View style={container}>
            {children}
        </View>
    )
}