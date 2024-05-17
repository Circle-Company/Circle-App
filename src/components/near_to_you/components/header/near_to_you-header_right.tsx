import React from "react"
import { View, Text } from "react-native"
import { RankingHeaderRightProps } from "../../near_to_you-types"
import sizes from "../../../../layout/constants/sizes"

export default function header_right ({children}: RankingHeaderRightProps) {
    const container:any = {
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row'
    }
    
    return (
        <View style={container}>
            {children}
        </View>
    )
}