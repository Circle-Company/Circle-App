import React from "react"
import { View } from "react-native"
import { MemoryTopRightRootProps } from "../../../memory-types"

export default function top_right_root ({children}: MemoryTopRightRootProps) {
    
    return <View>{children}</View>
}