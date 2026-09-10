import React from "react"
import { Text, View, type TextStyle, type ViewStyle } from "react-native"

import ColorTheme, { colors as palette } from "@/constants/colors"
import appSizes from "@/constants/sizes"
import fonts from "@/constants/fonts"

import TypingDot from "./typing.dot"
import { messageSizes } from "../message/message.sizes"
import type { TypingIndicatorProps } from "./typing.indicator.types"

/** Quantos pontos. Três é o mínimo para a onda ter direção — com dois ela só pisca. */
const DOT_COUNT = 3

/** Diâmetro do ponto, em fração do corpo de texto da bolha. */
const DOT_RATIO = 0.42

/** Defasagem entre um ponto e o seguinte. É o que faz a onda correr, em vez de pularem juntos. */
const STAGGER_MS = 150

/**
 * A bolha de "digitando".
 *
 * É uma bolha de verdade, com o mesmo fundo, raio e recuo das mensagens recebidas — e não um
 * rótulo no topo da conversa. Digitar é a mensagem que está para chegar, então ela ocupa o
 * lugar onde a mensagem vai aparecer: no fim da lista, do lado de quem está escrevendo. É o
 * que faz o texto substituir os pontos sem nada saltar quando ele chega.
 *
 * Quem decide **se** ela aparece é quem renderiza — o contexto global do chat já sabe quem
 * está digitando em cada conversa (`isTypingIn`). Este componente só desenha.
 *
 * O `size` vem do mesmo preset das bolhas para os pontos acompanharem o corpo de texto da
 * conversa: numa conversa `compact` uma bolha de digitando em tamanho `standart` apareceria
 * maior que as mensagens ao redor.
 */
function TypingIndicatorBase({
    size = messageSizes.standart,
    isMine = false,
    authorName,
    avatar,
}: TypingIndicatorProps) {
    const colors = ColorTheme()

    const dotSize = Math.round(size.fontSize * DOT_RATIO)

    const row: ViewStyle = {
        width: "100%",
        flexDirection: "row",
        alignItems: "flex-end",
        columnGap: size.gap,
        justifyContent: isMine ? "flex-end" : "flex-start",
        paddingHorizontal: appSizes.paddings["1sm"],
        marginTop: size.gap * 2,
    }

    // Mesmo desenho da bolha da mensagem, inclusive o canto colado do lado de quem fala: a
    // bolha de digitando é sempre a última do bloco, por definição.
    const bubble: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        columnGap: dotSize * 0.75,
        paddingHorizontal: size.padding,
        // Mais baixa que uma bolha de texto: não há linha de texto para acomodar, e a altura
        // cheia deixaria os pontos perdidos no meio de um vazio.
        paddingVertical: size.padding * 0.9,
        backgroundColor: isMine ? colors.primaryAccent : palette.gray.grey_08,
        borderRadius: size.borderRadius,
        borderBottomRightRadius: isMine ? size.borderRadiusTight : size.borderRadius,
        borderBottomLeftRadius: isMine ? size.borderRadius : size.borderRadiusTight,
    }

    const name: TextStyle = {
        fontSize: size.fontSize * 0.9,
        fontFamily: fonts.family.Semibold,
        color: colors.textDisabled,
        marginBottom: size.gap / 2,
    }

    /*
     * O ponto é claro sobre a bolha escura de quem recebe, e escuro sobre o roxo claro de
     * quem envia — a mesma inversão que o texto da bolha faz.
     */
    const dotColor = isMine ? colors.text : palette.gray.grey_04

    const dots = (
        <View style={bubble}>
            {Array.from({ length: DOT_COUNT }, (_, index) => (
                <TypingDot key={index} size={dotSize} color={dotColor} delay={index * STAGGER_MS} />
            ))}
        </View>
    )

    return (
        <View style={row}>
            {!isMine && avatar ? <View>{avatar}</View> : null}
            <View style={{ alignItems: isMine ? "flex-end" : "flex-start" }}>
                {authorName ? <Text style={name}>{authorName}</Text> : null}
                {dots}
            </View>
            {isMine && avatar ? <View>{avatar}</View> : null}
        </View>
    )
}

/**
 * Memoizado: ele vive no fim de uma lista que re-renderiza por motivos que não são dele. As
 * props mudam raramente — e a animação não depende de render nenhum, roda na thread de UI.
 */
export const TypingIndicator = React.memo(TypingIndicatorBase)

export default TypingIndicator
export * from "./typing.indicator.types"
