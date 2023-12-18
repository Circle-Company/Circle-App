import React from "react"
import { View, Text } from "react-native"
import { CommentsTopLeftRootProps } from "../../../comments-types"
import { useCommentsContext } from "../../../comments-context"
import sizes from "../../../../../layout/constants/sizes"

export default function top_left_root ({children}: CommentsTopLeftRootProps) {
    const { comment } = useCommentsContext()

    const container: any = {
        flex: 1,
        alignitems: 'center',
        justifyContent: 'center'
    }
    return (
        <View style={container}>
            {children}
        </View>     

    )
}