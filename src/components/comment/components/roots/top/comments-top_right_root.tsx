import React from "react"
import { View, Text } from "react-native"
import { CommentsTopRightRootProps } from "../../../comments-types"
import { useCommentsContext } from "../../../comments-context"
import sizes from "../../../../../layout/constants/sizes"

export default function top_right_root ({children}: CommentsTopRightRootProps) {
    const { comment } = useCommentsContext()

    const container: any = {
        alignItems: 'center',
    }
    return (
        <View style={container}>
            {children}
        </View>     

    )
}