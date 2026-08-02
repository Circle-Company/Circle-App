import React from "react"
import { View } from "react-native"
import sizes from "../../../../../constants/sizes"
import { useCommentsContext } from "../../../comments-context"
import { CommentsTopRootProps } from "../../../comments-types"

export default function TopRoot({ children }: CommentsTopRootProps) {
    const { comment, preview } = useCommentsContext()

    // Padding horizontal simétrico: o antigo (0.7 à esquerda, 1.4 à direita)
    // existia para o layout esticado e deslocaria o grupo centralizado.
    const container: any = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: sizes.margins["2sm"],
        paddingTop: sizes.paddings["1sm"] * 0.8,
        paddingHorizontal: sizes.paddings["1md"] * 0.7,
    }

    return <View style={container}>{preview && comment?.length == 0 ? null : children}</View>
}
