import React from "react"
import { View, ViewStyle } from "react-native"
import { ViewersHeaderLeftProps } from "../../viewers-types"

export default function header_left({ children }: ViewersHeaderLeftProps) {
    // Encolhe no conteúdo, com teto no espaço que o pai dá — o painel segue a
    // largura do moment, que é menor que a da tela.
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
