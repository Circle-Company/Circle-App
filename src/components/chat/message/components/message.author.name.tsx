import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageAuthorNameProps } from "../message.types"

/** Nome do autor no topo da bolha — só aparece em grupo, na primeira da sequência. */
function AuthorName({ color, fontSize }: MessageAuthorNameProps) {
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

/**
 * Memoizado: dentro de uma conversa a mensagem re-renderiza por motivos que não são deste
 * componente — o principal é o progresso da nota de voz, que chega várias vezes por segundo
 * como prop da árvore. Sem `memo`, cada tique redesenhava também texto, hora, status e
 * rótulos, que não mudaram.
 */
export default React.memo(AuthorName)
