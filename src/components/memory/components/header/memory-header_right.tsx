import React from "react"
import { View, Text } from "react-native"
import { MemoryHeaderRightProps } from "../../memory-types"
import sizes from "../../../../layout/constants/sizes"

export default function header_right ({children}: MemoryHeaderRightProps) {
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