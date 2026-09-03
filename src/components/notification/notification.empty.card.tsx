import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import React from "react"
import { Platform } from "react-native"
import { TextStyle, ViewStyle, View, Animated } from "react-native"

import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"

export function NotificationEmptyCard() {
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
        paddingTop: sizes.paddings["1md"],
        paddingBottom: sizes.paddings["1lg"] * 0.8,
        borderRadius: sizes.borderRadius["1lg"] * 1.8,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    }

    const glassContainer: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        paddingTop: sizes.paddings["1md"],
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

    const iconStyle: TextStyle = {
        fontSize: 100,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    }

    if (shouldUseGlass)
        return (
            <GlassContainer spacing={10}>
                <GlassView
                    style={glassContainer}
                    colorScheme="dark"
                    glassEffectStyle="clear"
                    isInteractive={true}
                    tintColor={colors.gray.grey_09 + "90"}
                >
                    <Text style={iconStyle}>🔔</Text>
                    <Text style={title}>{t("You don't have any notifications")} 🥲</Text>
                    <Text style={description}>
                        {t(
                            "Interact with your friends and like their posts to receive notifications.",
                        )}
                    </Text>
                </GlassView>
            </GlassContainer>
        )
    else
        return (
            <View style={container}>
                <Text style={iconStyle}>🔔</Text>
                <Text style={title}>{t("You don't have any notifications")} 🥲</Text>
                <Text style={description}>
                    {t("Interact with your friends and like their posts to receive notifications.")}
                </Text>
                z
            </View>
        )
}
