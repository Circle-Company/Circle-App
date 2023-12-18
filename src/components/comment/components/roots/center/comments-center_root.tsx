import React from "react"
import { View, Text } from "react-native"
import { CommentsCenterRootProps } from "../../../comments-types"
import { useCommentsContext } from "../../../comments-context"
import sizes from "../../../../../layout/constants/sizes"

export default function center_root ({children}: CommentsCenterRootProps) {
    const { comment } = useCommentsContext()

    const container: any = {
        paddingLeft: sizes.paddings["1md"]*0.7,
        paddingRight: sizes.paddings["1md"]*1.4,
    }
    return (
        <View style={container}>
            {children}
        </View>     

    )
}