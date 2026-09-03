import { View, ViewStyle } from "react-native"

import React from "react"
import { CommentsHeaderLeftProps } from "../../comments-types"

export default function header_left({ children }: CommentsHeaderLeftProps) {
    // Sem `width: "100%"` nem o `paddingLeft` assimétrico — ambos empurravam o
    // título para a esquerda. Encolhe no conteúdo e centraliza.
    //
    // O teto é o espaço que o pai realmente dá, não uma fração da largura da
    // TELA: o bloco de comentários acompanha a largura do moment, que agora é
    // menor que a tela, e o cap antigo deixava o texto vazar para uma 2ª linha.
    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "100%",
        flexShrink: 1,
        borderRadius: 20,
        paddingVertical: 4,
    }
    return <View style={container}>{children}</View>
}
