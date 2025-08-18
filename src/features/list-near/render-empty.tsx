import React, { useCallback, useEffect } from "react"
import { Animated, Easing, TextStyle, ViewStyle, useColorScheme } from "react-native"
import { Text, View } from "../../components/Themed"
import ColorTheme, { colors } from "../../constants/colors"

import fonts from "../../constants/fonts"
import sizes from "../../constants/sizes"
import { useNearContext } from "../../contexts/near"
import LanguageContext from "../../contexts/Preferences/language"

export function EmptyList() {
    const { t } = React.useContext(LanguageContext)
    const { loading } = useNearContext()
    const isDarkMode = useColorScheme() === "dark"

    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current
    const moveAnim = React.useRef(new Animated.Value(30)).current
    const spinAnim = React.useRef(new Animated.Value(0)).current
    const buttonFadeAnim = React.useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            Animated.timing(moveAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(buttonFadeAnim, {
                toValue: 1,
                duration: 1000,
                delay: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start()
    }, [fadeAnim, moveAnim, scaleAnim, buttonFadeAnim])

    const startSpinAnimation = useCallback(() => {
        spinAnim.setValue(0)
        Animated.timing(spinAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start(() => {
            if (loading) startSpinAnimation()
        })
    }, [loading, spinAnim])

    useEffect(() => {
        if (loading) {
            startSpinAnimation()
        }
    }, [loading, startSpinAnimation])

    const cardContainerStyle: ViewStyle = {
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        borderRadius: sizes.borderRadius["1md"],
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2md"],
        marginTop: sizes.margins["2sm"],
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
    }

    const messageTextStyle: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
        textAlign: "center",
        marginBottom: sizes.margins["2sm"],
        color: ColorTheme().text,
    }

    const subMessageTextStyle: TextStyle = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        textAlign: "center",
        lineHeight: 16,
    }

    return (
        <>
            <View style={cardContainerStyle}>
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: moveAnim }, { scale: scaleAnim }],
                    }}
                >
                    <Text style={messageTextStyle}>
                        {t("Parece que não tem ninguém por perto.")}
                    </Text>
                    <Text style={subMessageTextStyle}>
                        {t(
                            "Verifique se sua conecção com a internet e localização estão habilitadas.",
                        )}
                    </Text>
                </Animated.View>
            </View>
        </>
    )
}
