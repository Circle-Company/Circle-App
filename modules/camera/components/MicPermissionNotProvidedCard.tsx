import ButtonStandart from "@/components/buttons/button-standart"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import React from "react"
import { Platform } from "react-native"
import { Linking } from "react-native"
import { TextStyle, ViewStyle, View, Animated } from "react-native"

import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"

export function MicPermissionNotProvidedCard() {
    const { t } = React.useContext(LanguageContext)
    const animatedOpacity = React.useRef(new Animated.Value(0)).current
    const shouldUseGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    function handleAnimation() {
        Animated.spring(animatedOpacity, {
            toValue: 1,
            bounciness: 0,
            speed: 30,
            useNativeDriver: true,
            delay: 90,
        }).start()
    }

    React.useEffect(() => {
        handleAnimation()
    }, [])

    const container: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingBottom: sizes.paddings["1lg"] * 0.8,
        borderRadius: sizes.borderRadius["1lg"] * 1.3,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const glassContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        paddingVertical: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1lg"] * 1.3,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const title: TextStyle = {
        fontSize: fonts.size.title3 * 0.8,
        fontFamily: fonts.family.ExtraBold,
        fontStyle: "italic",
        textAlign: "center",
    }

    const description: TextStyle = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_03,
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
    }
    const buttonContainer: ViewStyle = {
        alignSelf: "center",
        alignItems: "center",
        marginTop: sizes.margins["2sm"],
        maxWidth: sizes.buttons.width,
        height: sizes.buttons.height * 0.4,
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: colors.gray.white,
    }

    const buttonLabel: any = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body,
        color: colors.gray.black,
    }

    async function handleGoToSettings() {
        await Linking.openSettings()
    }

    if (shouldUseGlass)
        return (
            <GlassContainer spacing={10}>
                <GlassView
                    style={glassContainer}
                    colorScheme="dark"
                    glassEffectStyle="clear"
                    isInteractive={false}
                    tintColor={colors.gray.black + "99"}
                >
                    <Text style={title}>{t("Microphone was no enabled")} 🎙️😭</Text>
                    <Text style={description}>
                        {t(
                            "To record audio you need to enable microphone permission in your settings",
                        )}
                    </Text>
                    <ButtonStandart
                        style={buttonContainer}
                        margins={false}
                        action={handleGoToSettings}
                    >
                        <Text style={buttonLabel}>{t("Go to Settings")}</Text>
                    </ButtonStandart>
                </GlassView>
            </GlassContainer>
        )
    else
        return (
            <View style={container}>
                <Text style={title}>{t("Microphone was no enabled")} 🎙️😭</Text>
                <Text style={description}>
                    {t("To record audio you need to enable microphone permission in your settings")}
                </Text>
                <ButtonStandart style={buttonContainer} margins={false} action={handleGoToSettings}>
                    <Text style={buttonLabel}>{t("Go to Settings")}</Text>
                </ButtonStandart>
            </View>
        )
}
