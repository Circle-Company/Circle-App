import React from "react"
import { View } from "react-native"
import { ViewersCenterRootProps } from "../../../viewers-types"

export default function center_root({ children }: ViewersCenterRootProps) {
    return <View>{children}</View>
}
