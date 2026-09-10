import React from "react"
import { Platform, Text, View, type TextStyle, type ViewStyle } from "react-native"

import { isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

import { DateSeparatorIOS } from "./date.separator.ios"
import type { DateSeparatorProps } from "./date.separator.types"

/**
 * Etiqueta de dia ("HOJE") entre blocos da lista.
 *
 * Não pertence a nenhuma mensagem: é a lista do chat que decide onde a virada
 * de dia acontece, então o componente vive fora do `Message` e não toca o
 * contexto dele.
 */
function DateSeparatorBase({ date, floating = false, stickyTopInset = 0 }: DateSeparatorProps) {
    const colors = ColorTheme()

    const containerStyle: ViewStyle = {
        alignSelf: "center",
        paddingHorizontal: sizes.paddings["2sm"],
        paddingVertical: 4,
        borderRadius: sizes.borderRadius["1sm"],
        backgroundColor: colors.backgroundDisabled,
        // Solta no meio da conversa, a etiqueta precisa de bastante ar acima: ela encerra um
        // dia e abre outro, e um respiro curto a faz parecer parte do bloco anterior.
        marginTop: floating ? stickyTopInset : sizes.margins["1xl"],
        marginBottom: floating ? 0 : sizes.margins["2sm"],
    }
    const textStyle: TextStyle = {
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Bold,
        letterSpacing: 0.5,
        color: colors.textDisabled,
    }

    return (
        <View style={containerStyle}>
            <Text style={textStyle}>{date.toUpperCase()}</Text>
        </View>
    )
}

/**
 * O vidro só existe a partir de uma versão do iOS. A checagem fica aqui, num lugar só, e cada
 * versão do componente cuida do próprio desenho — a de fallback continua simples, que é a que
 * roda em todo lugar.
 */
const useGlass = () =>
    Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

function DateSeparatorRoot(props: DateSeparatorProps) {
    return useGlass() ? <DateSeparatorIOS {...props} /> : <DateSeparatorBase {...props} />
}

/** Memoizado: divisores nunca mudam depois de montados, mas re-renderizam junto da lista. */
export const DateSeparator = React.memo(DateSeparatorRoot)

export type { DateSeparatorProps }
