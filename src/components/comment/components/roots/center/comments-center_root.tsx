import { CommentsCenterRootProps } from "../../../comments-types"
import React from "react"
import { View } from "react-native"

export default function center_root({ children }: CommentsCenterRootProps) {
    return <View>{children}</View>
}
