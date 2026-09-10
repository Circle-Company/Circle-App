import React from "react"
import { Pressable, Text, type TextStyle, type ViewStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import LanguageContext from "@/contexts/language"
import MessageContext from "../context/provider"
import MessageSymbol from "./message.symbol"
import fonts from "@/constants/fonts"
import { MessageRepliesProps } from "../message.types"
import { showsReplies } from "../helpers/footerContent"

/**
 * Quantas mensagens responderam a esta.
 *
 * Vive no rodapé, ao lado do estado de entrega: é informação sobre a mensagem
 * como um ponto da conversa, não sobre o que ela diz.
 *
 * A contagem vem do dado (`replyCount`), e não de varrer a lista: a tela carrega
 * uma janela da conversa, e contar ali daria números diferentes conforme a
 * rolagem — inclusive "0 respostas" numa mensagem respondida ontem.
 */
function MessageReplies({ color, fontSize, onPress }: MessageRepliesProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const { t } = React.useContext(LanguageContext)
    const colors = ColorTheme()

    // A regra mora no helper porque o rodapé precisa da mesma resposta antes de desenhar a
    // caixa — ver `helpers/footerContent`.
    if (!showsReplies(data, options)) return null
    const count = data.replyCount ?? 0

    const tint = color ?? colors.textDisabled
    const glyphSize = (fontSize ?? size.fontSize * 0.75) * 1.1

    const container: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 4,
    }
    const label: TextStyle = {
        fontSize: fontSize ?? size.fontSize * 0.75,
        fontFamily: fonts.family.Regular,
        color: tint,
    }

    return (
        <Pressable style={container} onPress={onPress}>
            <MessageSymbol
                ios="arrowshape.turn.up.left"
                material="reply"
                size={glyphSize}
                color={tint}
            />
            <Text style={label}>
                {count === 1 ? t("1 reply") : t("{{count}} replies", { count })}
            </Text>
        </Pressable>
    )
}

/**
 * Memoizado: dentro de uma conversa a mensagem re-renderiza por motivos que não são deste
 * componente — o principal é o progresso da nota de voz, que chega várias vezes por segundo
 * como prop da árvore. Sem `memo`, cada tique redesenhava também texto, hora, status e
 * rótulos, que não mudaram.
 */
export default React.memo(MessageReplies)
