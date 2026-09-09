import React from "react"
import { View } from "react-native"
import { ViewersTopLeftRootProps } from "../../../viewers-types"

export default function top_left_root({ children }: ViewersTopLeftRootProps) {
    // `flex: 1` segura o título à esquerda e empurra o botão para a borda.
    const container: any = {
        flex: 1,
        alignItems: "flex-start",
        justifyContent: "center",
    }
    return <View style={container}>{children}</View>
}
