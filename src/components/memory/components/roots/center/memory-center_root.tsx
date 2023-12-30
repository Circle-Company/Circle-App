import React from "react"
import { View, Text } from "react-native"
import { MemoryCenterRootProps } from "../../../memory-types"
import sizes from "../../../../../layout/constants/sizes"


export default function center_root ({children}: MemoryCenterRootProps) {

    const container:any = {
        zIndex: 10,
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        paddingHorizontal: sizes.paddings["1sm"]*0.8,
        paddingBottom: sizes.paddings["1sm"]*0.8
    }
    
    return (
        <View style={container}>
            {children}
        </View>
    )
}