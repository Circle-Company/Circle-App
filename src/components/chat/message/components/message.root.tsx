import React from "react"
import { View, type ViewStyle } from "react-native"

import sizes from "@/constants/sizes"
import { MessageProvider } from "../context/provider"
import { MessageProviderProps } from "../message.types"

/**
 * Única raiz da mensagem: monta o provider e a coluna que ocupa a linha da lista.
 *
 * Todo o resto (`Container`, `Bubble`, `Content`, `Footer`) é componente comum
 * que lê o contexto — não precisa ser raiz porque nenhum deles cria contexto.
 */
export default function Root({ children, data, options, size }: MessageProviderProps) {
    const container: ViewStyle = {
        width: "100%",
        paddingHorizontal: sizes.paddings["1sm"],
    }

    return (
        <MessageProvider data={data} options={options} size={size}>
            <View style={container}>{children}</View>
        </MessageProvider>
    )
}
