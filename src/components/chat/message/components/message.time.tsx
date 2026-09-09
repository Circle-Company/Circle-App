import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageTimeProps } from "../message.types"

/** Hora da mensagem (HH:mm) no rodapé da bolha. */
export default function MessageTime({ color, fontSize }: MessageTimeProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    const label = React.useMemo(() => {
        if (!data.createdAt) return ""
        const date = new Date(data.createdAt)
        if (Number.isNaN(date.getTime())) return ""
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }, [data.createdAt])

    const text_style: TextStyle = {
        fontSize: fontSize ?? size.fontSize * 0.75,
        fontFamily: fonts.family.Regular,
        color: color ?? (options.isMine ? colors.background : colors.textDisabled),
    }

    return <Text style={text_style}>{label}</Text>
}
