import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageForwardedLabelProps } from "../message.types"

/** Marca "Encaminhada" no topo da bolha. */
export default function ForwardedLabel({ color, fontSize }: MessageForwardedLabelProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    if (!data.forwarded || options.messageType === "deleted") return null

    const text_style: TextStyle = {
        fontSize: fontSize ?? size.fontSize * 0.8,
        fontFamily: fonts.family["Regular-Italic"],
        color: color ?? (options.isMine ? colors.background : colors.textDisabled),
        opacity: 0.9,
    }

    return <Text style={text_style}>↱ Encaminhada</Text>
}
