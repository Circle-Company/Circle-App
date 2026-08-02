import { View, ViewStyle } from "react-native"

import React from "react"
import sizes from "../../../../constants/sizes"
import { CommentsHeaderLeftProps } from "../../comments-types"

export default function header_left({ children }: CommentsHeaderLeftProps) {
    // Sem `width: "100%"` nem o `paddingLeft` assimétrico — ambos empurravam o
    // título para a esquerda. Encolhe no conteúdo e centraliza.
    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: sizes.screens.width * 0.6,
        borderRadius: 20,
        paddingVertical: 4,
    }
    return <View style={container}>{children}</View>
}
