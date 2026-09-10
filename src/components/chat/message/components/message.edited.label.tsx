import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageEditedLabelProps } from "../message.types"
import { showsEdited } from "../helpers/footerContent"

/** Marca "editada" no rodapé, quando `editedAt` está preenchido. */
function EditedLabel({ color, fontSize }: MessageEditedLabelProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    if (!showsEdited(data, options)) return null

    const text_style: TextStyle = {
        fontSize: fontSize ?? size.fontSize * 0.75,
        fontFamily: fonts.family["Regular-Italic"],
        // Fora da bolha o rodapé fica sobre o fundo da conversa, então a cor não
        // depende mais do lado da mensagem.
        color: color ?? colors.textDisabled,
    }

    return <Text style={text_style}>editada ·</Text>
}

/**
 * Memoizado: dentro de uma conversa a mensagem re-renderiza por motivos que não são deste
 * componente — o principal é o progresso da nota de voz, que chega várias vezes por segundo
 * como prop da árvore. Sem `memo`, cada tique redesenhava também texto, hora, status e
 * rótulos, que não mudaram.
 */
export default React.memo(EditedLabel)
