import React from "react"
import { Text, type TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import MessageContext from "../context/provider"
import { MessageTextProps } from "../message.types"
import { formatLinkForDisplay, resolveLinkOnly } from "../helpers/resolveLinkOnly"

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
function MessageText({ content: contentProp, color, fontSize, fontFamily }: MessageTextProps) {
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

    /**
     * Mensagem que é **só** um link: o endereço vira o destaque da bolha.
     *
     * Sublinhado além da cor, e não só a cor: um link precisa se anunciar como alvo mesmo
     * para quem não distingue bem a matiz. Na bolha enviada o fundo já é claro, então o
     * sublinhado carrega o peso sozinho.
     */
    const linkOnly = contentProp || isDeleted ? null : resolveLinkOnly(content)
    const link_style: TextStyle = {
        ...text_style,
        fontFamily: fonts.family.Semibold,
        color: options.isMine ? colors.background : colors.primary,
        textDecorationLine: "underline",
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

    if (linkOnly) {
        // Exibe sem o protocolo. O endereço completo segue em `data.content`, que é o que se
        // abre ao tocar — o corte é de exibição, não do dado.
        return <Text style={link_style}>{formatLinkForDisplay(linkOnly)}</Text>
    }

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

/**
 * Memoizado: dentro de uma conversa a mensagem re-renderiza por motivos que não são deste
 * componente — o principal é o progresso da nota de voz, que chega várias vezes por segundo
 * como prop da árvore. Sem `memo`, cada tique redesenhava também texto, hora, status e
 * rótulos, que não mudaram.
 */
export default React.memo(MessageText)
