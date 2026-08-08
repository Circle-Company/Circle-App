import ButtonStandart from "@/components/buttons/button-standart"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import React from "react"
import { router } from "expo-router"
import { Platform } from "react-native"
import { Image, ImageStyle, TextStyle, ViewStyle, View, Animated } from "react-native"

import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"

/**
 * Ocupa o lugar do feed enquanto a conta ainda não publicou nenhum momento:
 * o feed só é liberado depois do primeiro. Mesma linguagem visual do card
 * "Capture Your Day" (EmptyList), que aparece quando o feed vem vazio.
 */
export function NoMomentsCard() {
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
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingTop: sizes.paddings["1lg"] * 1.2,
        paddingBottom: sizes.paddings["1lg"] * 1.6,
        borderRadius: sizes.borderRadius["1lg"] * 1.8,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const glassContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        paddingTop: sizes.paddings["1lg"],
        paddingBottom: sizes.paddings["1lg"] * 1.6,
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

    // Ilustração provisória: por ora a mesma do card "Capture Your Day".
    const illustrationStyle: ImageStyle = {
        width: sizes.screens.width * 0.9,
        height: sizes.screens.width * 0.9,
        marginTop: sizes.margins["1sm"],
        marginBottom: sizes.margins["1md"],
    }

    function handleRecordFirstMoment() {
        router.push("/(tabs)/create")
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
                        <Image
                            source={require("@/assets/images/illustrations/FirstMoment-Illustration.png")}
                            style={illustrationStyle}
                            resizeMode="contain"
                        />
                        <Text style={title}>{t("Record Your First Moment")} 🎥</Text>
                        <Text style={description}>
                            {t(
                                "Record your first moment to unlock the feed and discover Moments from people around you.",
                            )}
                        </Text>

                        <ButtonStandart
                            style={buttonContainer}
                            margins={false}
                            action={handleRecordFirstMoment}
                        >
                            <Text style={buttonLabel}>{t("Record Now")}</Text>
                        </ButtonStandart>
                    </GlassView>
                </GlassContainer>
            </Animated.View>
        )
    else
        return (
            <Animated.View style={{ opacity: animatedOpacity }}>
                <View style={container}>
                    <Image
                        source={require("@/assets/images/illustrations/NewMoment-Illustration.png")}
                        style={illustrationStyle}
                        resizeMode="contain"
                    />
                    <Text style={title}>{t("Record Your First Moment")} 📸</Text>
                    <Text style={description}>
                        {t(
                            "Record your first moment to unlock the feed and discover Moments from people around you.",
                        )}
                    </Text>

                    <ButtonStandart
                        style={buttonContainer}
                        margins={false}
                        action={handleRecordFirstMoment}
                    >
                        <Text style={buttonLabel}>{t("Record Now")}</Text>
                    </ButtonStandart>
                </View>
            </Animated.View>
        )
}
