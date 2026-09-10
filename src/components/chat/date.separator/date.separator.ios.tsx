import React from "react"
import { Text, type TextStyle, type ViewStyle } from "react-native"
import { GlassView } from "expo-glass-effect"

import ColorTheme, { colors as palette } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

import type { DateSeparatorProps } from "./date.separator.types"

/**
 * A etiqueta de dia com fundo de vidro, no iOS.
 *
 * Existe em arquivo próprio porque o vidro não é um detalhe de estilo: é uma view nativa, com
 * disponibilidade condicionada à versão do sistema. Misturar as duas versões num componente só
 * deixaria a checagem de disponibilidade e dois conjuntos de estilo no mesmo lugar, e a versão
 * de fallback é a que precisa continuar simples — ela é a que roda em todo lugar.
 *
 * Quem decide qual das duas usar é o `index.tsx`; aqui parte-se do princípio de que o vidro
 * está disponível.
 *
 * **O vidro cai bem justamente aqui.** A etiqueta fica fixada sobre a conversa enquanto se
 * rola, com as mensagens passando por trás — é o caso de uso do material: deixar ver o que
 * está atrás sem perder a legibilidade do que está na frente. Uma pílula opaca corta a
 * conversa; o vidro a atravessa.
 */
export function DateSeparatorIOS({
    date,
    floating = false,
    stickyTopInset = 0,
}: DateSeparatorProps) {
    const colors = ColorTheme()

    const container: ViewStyle = {
        alignSelf: "center",
        paddingHorizontal: sizes.paddings["2sm"],
        paddingVertical: 4,
        borderRadius: sizes.borderRadius["1sm"],
        overflow: "hidden",
        // Solta no meio da conversa, a etiqueta encerra um dia e abre outro, e precisa de ar
        // acima para não parecer parte do bloco anterior. Fixada, ela é um rótulo colado no
        // header, e o mesmo respiro só a empurraria para longe dele.
        marginTop: floating ? stickyTopInset : sizes.margins["1xl"],
        marginBottom: floating ? 0 : sizes.margins["2sm"],
    }

    const text: TextStyle = {
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Bold,
        letterSpacing: 0.5,
        color: colors.textDisabled,
    }

    return (
        <GlassView
            colorScheme="dark"
            style={container}
            glassEffectStyle="regular"
            // Não é um controle: não responde ao toque nem deve reagir a ele.
            isInteractive={false}
            // Um véu escuro por cima do vidro. Sobre a conversa preta o vidro puro fica claro
            // demais e a etiqueta rouba atenção das mensagens.
            tintColor={palette.gray.grey_09 + "80"}
        >
            <Text style={text}>{date.toUpperCase()}</Text>
        </GlassView>
    )
}

export default React.memo(DateSeparatorIOS)
