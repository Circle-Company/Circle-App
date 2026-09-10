import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import MessageContext from "../context/provider"
import { MessageTextProps } from "../message.types"

/**
 * Texto da mensagem (ou legenda da mídia).
 *
 * Numa mensagem apagada ele vira a lápide: o rótulo é nosso porque `content`
 * chega nulo do backend — o conteúdo original não deve trafegar. Quem decide é
 * o `messageType` do contexto, não quem monta a árvore.
 *
 * As menções chegam como intervalos sobre a string crua, então o corte é feito
 * por índice: nada de regex por cima do texto do usuário.
 */
export default function MessageText({
    content: contentProp,
    color,
    fontSize,
    fontFamily,
}: MessageTextProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const { t } = React.useContext(LanguageContext)
    const colors = ColorTheme()

    const isDeleted = options.messageType === "deleted"
    const content =
        contentProp ?? (isDeleted ? t("This message was deleted") : (data.content ?? ""))

    const textColor = isDeleted
        ? colors.textDisabled
        : (color ?? (options.isMine ? colors.background : colors.text))

    const text_style: TextStyle = {
        // A lápide é metadado, não conteúdo: vai na escala das outras marcas do
        // rodapé ("editada", "encaminhada"), e não na do texto que a pessoa
        // escreveu — no tamanho cheio ela pesava mais que a própria conversa.
        fontSize: fontSize ?? (isDeleted ? size.fontSize * 0.85 : size.fontSize),
        fontFamily:
            fontFamily ?? (isDeleted ? fonts.family["Regular-Italic"] : fonts.family.Regular),
        color: textColor,
    }
    const mention_style: TextStyle = {
        ...text_style,
        fontFamily: fonts.family.Semibold,
        color: options.isMine ? colors.background : colors.primary,
    }

    // Sem texto não se renderiza nada — nem um `Text` vazio.
    //
    // Uma nota de voz sem legenda caía aqui e desenhava um nó de altura zero, que
    // mesmo assim contava como filho no `rowGap` do conteúdo: sobrava um vão no
    // pé da bolha sem nada que o explicasse.
    if (!content) return null

    // Com texto sobrescrito os índices das menções não valem mais: eles apontam
    // para a string original, e aplicá-los aqui recortaria no lugar errado.
    // Com texto sobrescrito (ou na lápide) os índices das menções não valem mais:
    // eles apontam para a string original e recortariam no lugar errado.
    const mentions =
        contentProp || isDeleted ? [] : [...(data.mentions ?? [])].sort((a, b) => a.start - b.start)

    if (!mentions.length) {
        return <Text style={text_style}>{content}</Text>
    }

    const parts: React.ReactNode[] = []
    let cursor = 0
    mentions.forEach((mention, index) => {
        if (mention.start > cursor) parts.push(content.slice(cursor, mention.start))
        parts.push(
            <Text key={`${mention.userId}-${index}`} style={mention_style}>
                {content.slice(mention.start, mention.end)}
            </Text>,
        )
        cursor = mention.end
    })
    if (cursor < content.length) parts.push(content.slice(cursor))

    return <Text style={text_style}>{parts}</Text>
}
