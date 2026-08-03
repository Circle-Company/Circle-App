import React from "react"
import { View } from "react-native"
import { CommentsTopLeftRootProps } from "../../../comments-types"

export default function top_left_root({ children }: CommentsTopLeftRootProps) {
    // `flex: 1` faz este bloco ocupar o espaço restante, mantendo o título
    // colado à esquerda enquanto o botão fica na borda direita do TopRoot.
    const container: any = {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center",
    }
    return <View style={container}>{children}</View>
}
