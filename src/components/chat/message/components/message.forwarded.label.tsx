import React from "react"
import { Text, View, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import MessageSymbol from "./message.symbol"
import { MessageForwardedLabelProps } from "../message.types"

/** Marca "Encaminhada" no topo da bolha. */
function ForwardedLabel({ color, fontSize }: MessageForwardedLabelProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    if (!data.forwarded || options.messageType === "deleted") return null

    const text_style: TextStyle = {
        fontSize: fontSize ?? size.fontSize * 0.8,
        fontFamily: fonts.family["Regular-Italic"],
        color: color ?? (options.isMine ? colors.background : colors.textDisabled),
    }

    const glyphSize = (fontSize ?? size.fontSize * 0.8) * 1.1

    return (
        <View style={{ flexDirection: "row", alignItems: "center", columnGap: 4, opacity: 0.9 }}>
            <MessageSymbol
                ios="arrowshape.turn.up.right"
                material="forward"
                size={glyphSize}
                color={text_style.color as string}
            />
            <Text style={text_style}>Encaminhada</Text>
        </View>
    )
}

/**
 * Memoizado: dentro de uma conversa a mensagem re-renderiza por motivos que não são deste
 * componente — o principal é o progresso da nota de voz, que chega várias vezes por segundo
 * como prop da árvore. Sem `memo`, cada tique redesenhava também texto, hora, status e
 * rótulos, que não mudaram.
 */
export default React.memo(ForwardedLabel)
