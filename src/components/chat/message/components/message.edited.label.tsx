import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageEditedLabelProps } from "../message.types"

/** Marca "editada" no rodapé, quando `editedAt` está preenchido. */
export default function EditedLabel({ color, fontSize }: MessageEditedLabelProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    if (!data.editedAt || options.messageType === "deleted") return null

    const text_style: TextStyle = {
        fontSize: fontSize ?? size.fontSize * 0.75,
        fontFamily: fonts.family["Regular-Italic"],
        // Fora da bolha o rodapé fica sobre o fundo da conversa, então a cor não
        // depende mais do lado da mensagem.
        color: color ?? colors.textDisabled,
    }

    return <Text style={text_style}>editada ·</Text>
}
