import React from "react"
import { View } from "react-native"
import { CommentsTopLeftRootProps } from "../../../comments-types"

export default function top_left_root ({children}: CommentsTopLeftRootProps) {

    const container: any = {
        flex: 1,
        alignitems: 'center',
        justifyContent: 'center'
    }
    return <View style={container}>{children}</View>     
}