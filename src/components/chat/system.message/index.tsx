import React from "react"
import { Text, View, type TextStyle, type ViewStyle } from "react-native"

import ColorTheme from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

export type SystemMessageProps = {
    /** Texto do aviso, já resolvido pela lista ("Rafael entrou no grupo"). */
    text: string
}

/**
 * Aviso do sistema no meio da lista ("Rafael entrou no grupo").
 *
 * Não é bolha nem tem autor, então vive fora do `Message`: quem o posiciona é a
 * lista do chat, e ele não toca o contexto da mensagem.
 */
function SystemMessageBase({ text }: SystemMessageProps) {
    const colors = ColorTheme()

    const containerStyle: ViewStyle = {
        alignSelf: "center",
        paddingHorizontal: sizes.paddings["2sm"],
        paddingVertical: sizes.paddings["1sm"] / 1.5,
        borderRadius: sizes.borderRadius["1sm"],
        backgroundColor: colors.background,
        marginVertical: sizes.margins["1sm"],
    }
    const textStyle: TextStyle = {
        textAlign: "center",
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Regular,
        color: colors.text,
    }

    return (
        <View style={containerStyle}>
            <Text style={textStyle}>{text}</Text>
        </View>
    )
}

/** Memoizado: divisores nunca mudam depois de montados, mas re-renderizam junto da lista. */
export const SystemMessage = React.memo(SystemMessageBase)
