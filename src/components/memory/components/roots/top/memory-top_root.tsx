import React from "react"
import { View, Text } from "react-native"
import { MemoryTopRootProps } from "../../../memory-types"
import { useMemoryContext } from "../../../memory-context"
import sizes from "../../../../../layout/constants/sizes"

export default function top_root ({children}: MemoryTopRootProps) {
    const { memories } = useMemoryContext()

    const container:any = {
    }
    
    return (
        <View style={container}>
            {children}
            <Text>memory-top_root</Text>
        </View>
    )
}