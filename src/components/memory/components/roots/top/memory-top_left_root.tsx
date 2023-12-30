import React from "react"
import { View, Text } from "react-native"
import { MemoryTopLeftRootProps } from "../../../memory-types"
import { useMemoryContext } from "../../../memory-context"
import sizes from "../../../../../layout/constants/sizes"

export default function top_left_root ({children}: MemoryTopLeftRootProps) {
    const { memories } = useMemoryContext()

    const container:any = {
    }
    
    return (
        <View style={container}>
            {children}
            <Text>memory-top_left_root</Text>
        </View>
    )
}