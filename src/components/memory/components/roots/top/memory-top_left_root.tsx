import React from "react"
import { View } from "react-native"
import { MemoryTopLeftRootProps } from "../../../memory-types"

export default function top_left_root ({children}: MemoryTopLeftRootProps) {
    return <View> {children} </View>
}