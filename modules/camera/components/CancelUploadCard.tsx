import React from "react"
import { ActivityIndicator, Platform, TextStyle, View, ViewStyle } from "react-native"
import {
    GlassContainer,
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from "expo-glass-effect"

import ButtonStandart from "@/components/buttons/button-standart"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"

interface Props {
    onCancel: () => void
}

/**
 * Post-recording "publishing…" chip. Single row:
 *
 *   [spinner]  Publishing ⚡           [ Cancel ]
 *
 * The cancel-window countdown is invisible — the spinner conveys "working"
 * while the parent hook auto-commits at expiry.
 */
export function CancelUploadCard({ onCancel }: Props): React.ReactElement {
    const { t } = React.useContext(LanguageContext)
    const useGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const cardWidth = sizes.screens.width - sizes.paddings["2sm"] * 2

    const container: ViewStyle = {
        width: cardWidth,
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["2sm"],
        paddingHorizontal: sizes.paddings["1md"],
        borderRadius: sizes.borderRadius["1lg"] * 1.3,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
    }

    const glassContainer: ViewStyle = {
        width: cardWidth,
        paddingVertical: sizes.paddings["2sm"],
        paddingHorizontal: sizes.paddings["1md"],
        borderRadius: sizes.borderRadius["1lg"] * 1.3,
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
    }

    const title: TextStyle = {
        fontSize: fonts.size.title3 * 0.8,
        fontFamily: fonts.family.ExtraBold,
        fontStyle: "italic",
        marginLeft: sizes.margins["2sm"],
        flex: 1,
    }

    const buttonContainer: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        height: sizes.buttons.height * 0.4,
        paddingHorizontal: sizes.paddings["1md"],
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: colors.gray.white,
    }

    const buttonLabel: TextStyle = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body,
        color: colors.gray.black,
    }

    const inner = (
        <>
            <ActivityIndicator size="small" color={colors.gray.white} />
            <Text style={title}>{t("Publishing")} ⚡</Text>
            <ButtonStandart style={buttonContainer} margins={false} action={onCancel}>
                <Text style={buttonLabel}>{t("Cancel")}</Text>
            </ButtonStandart>
        </>
    )

    if (useGlass) {
        return (
            <GlassContainer spacing={10}>
                <GlassView
                    style={glassContainer}
                    colorScheme="dark"
                    glassEffectStyle="clear"
                    isInteractive={false}
                    tintColor={colors.gray.black + "99"}
                >
                    {inner}
                </GlassView>
            </GlassContainer>
        )
    }
    return <View style={container}>{inner}</View>
}
