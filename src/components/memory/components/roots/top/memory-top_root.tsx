import React from "react"
import { View } from "react-native"
import { MemoryTopRootProps } from "../../../memory-types"
export default function top_root ({children}: MemoryTopRootProps) {
    return <View>{children}</View>
}