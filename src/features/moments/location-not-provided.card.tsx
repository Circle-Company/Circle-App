import ButtonStandart from "@/components/buttons/button-standart"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import GeolocationContext from "@/contexts/geolocation"
import React from "react"
import { Platform } from "react-native"
import { TextStyle, ViewStyle, View, Animated } from "react-native"

import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"

export function LocationNotProvidedCard() {
    const { t } = React.useContext(LanguageContext)
    const { openSettings } = React.useContext(GeolocationContext)

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
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingBottom: sizes.paddings["1lg"] * 0.8,
        borderRadius: sizes.borderRadius["1lg"] * 1.8,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const glassContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        paddingBottom: sizes.paddings["1lg"],
        borderRadius: sizes.borderRadius["1lg"] * 2,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const title: TextStyle = {
        fontSize: fonts.size.title2,
        fontFamily: fonts.family.ExtraBold,
        fontStyle: "italic",
        marginTop: sizes.margins["1sm"],
        marginBottom: sizes.margins["2sm"],
        textAlign: "center",
    }

    const description: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        paddingHorizontal: sizes.paddings["1md"],
        textAlign: "center",
    }
    const buttonContainer: ViewStyle = {
        alignSelf: "center",
        alignItems: "center",
        marginTop: sizes.margins["1md"],
        maxWidth: sizes.buttons.width,
        height: sizes.buttons.height * 0.5,
        borderRadius: sizes.borderRadius["1md"],
        overflow: "hidden",
        backgroundColor: colors.gray.white,
    }

    const buttonLabel: any = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body * 1.2,
        color: colors.gray.black,
    }

    const iconStyle: TextStyle = {
        fontSize: 100,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    }

    async function handleGoToSettings() {
        await openSettings()
    }

    if (shouldUseGlass)
        return (
            <Animated.View style={{ opacity: animatedOpacity }}>
                <GlassContainer spacing={10}>
                    <GlassView
                        style={glassContainer}
                        colorScheme="dark"
                        glassEffectStyle="clear"
                        isInteractive={true}
                        tintColor={colors.gray.black + 40}
                    >
                        <Text style={iconStyle}>📍</Text>
                        <Text style={title}>{t("Location not enabled")} 🧭</Text>
                        <Text style={description}>
                            {t(
                                "To discover Moments from people around you, enable location access in your settings.",
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
            </Animated.View>
        )
    else
        return (
            <Animated.View style={{ opacity: animatedOpacity }}>
                <View style={container}>
                    <Text style={iconStyle}>📍</Text>
                    <Text style={title}>{t("Location not enabled")} 🧭</Text>
                    <Text style={description}>
                        {t(
                            "To discover Moments from people around you, enable location access in your device settings.",
                        )}
                    </Text>

                    <ButtonStandart
                        style={buttonContainer}
                        margins={false}
                        action={handleGoToSettings}
                    >
                        <Text style={buttonLabel}>{t("Go to Settings")}</Text>
                    </ButtonStandart>
                </View>
            </Animated.View>
        )
}
