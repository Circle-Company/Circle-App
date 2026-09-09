import { Text, View, ViewStyle, TextStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

export type DateSeparatorProps = {
    /** Rótulo já formatado pela lista do chat ("Hoje", "Ontem", "12 de março"). */
    date: string
}

/**
 * Etiqueta de dia ("HOJE") entre blocos da lista.
 *
 * Não pertence a nenhuma mensagem: é a lista do chat que decide onde a virada
 * de dia acontece, então o componente vive fora do `Message` e não toca o
 * contexto dele.
 */
export function DateSeparator({ date }: DateSeparatorProps) {
    const colors = ColorTheme()

    const containerStyle: ViewStyle = {
        alignSelf: "center",
        paddingHorizontal: sizes.paddings["2sm"],
        paddingVertical: 4,
        borderRadius: sizes.borderRadius["1sm"],
        backgroundColor: colors.backgroundDisabled,
        marginVertical: sizes.margins["2sm"],
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
