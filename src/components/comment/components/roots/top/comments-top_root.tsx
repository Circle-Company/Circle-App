import { CommentsTopRootProps } from "../../../comments-types"
import React from "react"
import { View } from "react-native"
import sizes from "../../../../../layout/constants/sizes"
import { useCommentsContext } from "@/components/comment/comments-context"

export default function TopRoot({ children }: CommentsTopRootProps) {
    const { comment, preview } = useCommentsContext()

    const container: any = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: sizes.paddings["1sm"] * 0.8,
        paddingLeft: sizes.paddings["1md"] * 0.7,
        paddingRight: sizes.paddings["1md"] * 1.4,
    }

    return (
        <View style={container}>{preview && comment?.length == 0 ? null : children}</View>
    )
}
