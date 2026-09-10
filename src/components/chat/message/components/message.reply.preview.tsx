import React from "react"
import { Pressable, Text, type TextStyle, type ViewStyle } from "react-native"

import ColorTheme, { colors as palette } from "@/constants/colors"
import fonts from "@/constants/fonts"
import MessageContext from "../context/provider"
import { MessageReplyPreviewProps } from "../message.types"

/**
 * Citação da mensagem respondida.
 *
 * O nome do autor citado só aparece em **grupo**. Numa conversa de dois, dizer
 * quem escreveu é redundante — só há duas respostas possíveis, e o lado da bolha
 * citada já as distingue; a linha a mais só empurrava o texto para baixo.
 *
 * Sem barra colorida à esquerda: o bloco já se separa do texto pelo fundo
 * próprio, e a barra era uma segunda marca dizendo a mesma coisa.
 *
 * O toque é tratado aqui dentro, e não por um `Pressable` em volta na árvore:
 * fora, ele continuava existindo mesmo sem citação, e o `rowGap` do conteúdo
 * contava esse nó vazio — o que abria um vão só no topo da bolha.
 */
function ReplyPreview({ accentColor, onPress }: MessageReplyPreviewProps) {
    const { data, options, size } = React.useContext(MessageContext)
    const colors = ColorTheme()

    const reply = data.replyTo
    // Mensagem apagada não mostra o que ela citava.
    if (!reply || options.messageType === "deleted") return null

    const accent = accentColor ?? (options.isMine ? colors.background : colors.primary)

    const container: ViewStyle = {
        // Raio maior que o `borderRadiusTight`: a citação é um bloco por dentro da
        // bolha, e cantos quase retos ali brigavam com os cantos redondos dela.
        borderRadius: size.borderRadius / 1.6,
        // Na bolha enviada o fundo é um véu **claro** sobre o roxo, e não o escuro
        // que se usava antes: sobre um fundo já claro, escurecer criava um bloco
        // pesado no meio da bolha em vez de um degrau sutil.
        backgroundColor: options.isMine ? palette.transparent.white_50 : colors.backgroundDisabled,
        paddingVertical: size.padding / 1.5,
        paddingHorizontal: size.padding / 1.5,
        rowGap: 2,
        overflow: "hidden",
    }
    const author_style: TextStyle = {
        fontSize: size.fontSize * 0.85,
        fontFamily: fonts.family.Semibold,
        color: accent,
    }
    const preview_style: TextStyle = {
        fontSize: size.fontSize * 0.85,
        fontFamily: fonts.family.Regular,
        color: options.isMine ? colors.background : colors.textDisabled,
    }

    return (
        <Pressable style={container} onPress={onPress}>
            {options.isGroup ? (
                <Text style={author_style} numberOfLines={1}>
                    {reply.author?.name ?? reply.author?.username}
                </Text>
            ) : null}
            <Text style={preview_style} numberOfLines={2}>
                {reply.preview}
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
export default React.memo(ReplyPreview)
