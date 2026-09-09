import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageStatusProps } from "../message.types"

/**
 * Tiques de entrega. Só faz sentido nas mensagens que EU enviei — o status de
 * leitura de uma mensagem recebida não existe do lado de cá.
 *
 * TODO: trocar os glifos pelos ícones de SVG do design quando forem exportados.
 */
export default function MessageStatus({ color, size: sizeProp }: MessageStatusProps) {
    const { actions, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    if (!options.isMine) return null

    const glyph = {
        pending: "◌",
        sent: "✓",
        delivered: "✓✓",
        read: "✓✓",
        failed: "!",
    }[actions.status]

    const text_style: TextStyle = {
        fontSize: sizeProp ?? size.fontSize * 0.8,
        fontFamily: fonts.family.Semibold,
        color:
            color ??
            (actions.status === "failed"
                ? colors.error
                : actions.status === "read"
                  ? colors.background
                  : colors.background),
        opacity: actions.status === "read" ? 1 : 0.7,
    }

    return <Text style={text_style}>{glyph}</Text>
}
