import React from "react"
import { View } from "react-native"
import { CommentsTopLeftRootProps } from "../../../comments-types"

export default function top_left_root({ children }: CommentsTopLeftRootProps) {
    // Sem `flex: 1`: com ele este bloco esticava até o botão da direita e
    // empurrava o título para a borda esquerda. Encolhendo no conteúdo, o
    // `justifyContent: "center"` do TopRoot centraliza título + botão juntos.
    // (`alignitems`, com i minúsculo, era ignorado silenciosamente pelo RN.)
    const container: any = {
        alignItems: "center",
        justifyContent: "center",
    }
    return <View style={container}>{children}</View>
}
