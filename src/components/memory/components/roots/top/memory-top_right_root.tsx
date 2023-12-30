import React from "react"
import { View, Text } from "react-native"
import { MemoryTopRightRootProps } from "../../../memory-types"
import { useMemoryContext } from "../../../memory-context"
import sizes from "../../../../../layout/constants/sizes"

export default function top_right_root ({children}: MemoryTopRightRootProps) {
    const { memories } = useMemoryContext()

    const container:any = {
    }
    
    return (
        <View style={container}>
            {children}
            <Text>memory-top_right_root</Text>
        </View>
    )
}