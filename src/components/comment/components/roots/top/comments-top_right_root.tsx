import React from "react"
import { View } from "react-native"
import { CommentsTopRightRootProps } from "../../../comments-types"

export default function top_right_root({ children }: CommentsTopRightRootProps) {
    const container: any = {
        alignItems: "center",
    }

    return <View style={container}>{children}</View>
}
