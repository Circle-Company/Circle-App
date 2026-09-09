import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { Link } from "expo-router"

import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

const CARD = sizes.moment.standart

type MomentUnavailableProps = {
    /** Mensagem de erro definitivo. Ausente = deep link frio, ainda carregando. */
    message?: string | null
}

/**
 * O que ocupa o lugar do card quando não há momento para renderizar: deep link frio (sem
 * semente em memória, ainda carregando) ou erro definitivo.
 *
 * Fica **dentro** do `Link.AppleZoomTarget` de propósito. O detector de retângulo do iOS
 * mede o filho no instante em que a transição começa: sem alvo montado, com a geometria
 * final, a animação parte de lugar nenhum.
 */
export function MomentUnavailable({ message }: MomentUnavailableProps) {
    return (
        <Link.AppleZoomTarget>
            <View
                style={[styles.placeholder, { backgroundColor: ColorTheme().backgroundDisabled }]}
            >
                {message ? <Text style={styles.message}>{message}</Text> : null}
            </View>
        </Link.AppleZoomTarget>
    )
}

const styles = StyleSheet.create({
    placeholder: {
        width: CARD.width,
        height: CARD.height,
        borderRadius: CARD.borderRadius,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: sizes.paddings["1md"],
    },
    message: {
        color: colors.gray.white,
        fontFamily: fonts.family.Medium,
        fontSize: fonts.size.body,
        textAlign: "center",
    },
})
