import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageAuthorNameProps } from "../message.types"

/** Nome do autor no topo da bolha — só aparece em grupo, na primeira da sequência. */
export default function AuthorName({ color, fontSize }: MessageAuthorNameProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    if (!options.isGroup || options.isMine || !options.isFirstOfGroup) return null

    const text_style: TextStyle = {
        fontSize: fontSize ?? size.fontSize * 0.9,
        fontFamily: fonts.family.Semibold,
        color: color ?? data.author?.color ?? colors.primary,
    }

    return (
        <Text style={text_style} numberOfLines={1}>
            {data.author?.name ?? data.author?.username}
        </Text>
    )
}
