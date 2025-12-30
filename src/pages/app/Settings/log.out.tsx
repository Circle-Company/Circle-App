import * as LocalAuthentication from "expo-local-authentication"
import React from "react"
import { StatusBar, useColorScheme, Alert } from "react-native"
import ButtonStandart from "../../../components/buttons/button-standart"
import ColorTheme, { colors } from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import AuthContext from "../../../contexts/Auth"
import LanguageContext from "../../../contexts/Preferences/language"
import { ViewStyle, TextStyle, View, Text } from "react-native"

export default function LogOutScreen() {
    const { t } = React.useContext(LanguageContext)
    const { signOut } = React.useContext(AuthContext)
    const isDarkMode = useColorScheme() === "dark"

    const container: ViewStyle = {
        paddingTop: sizes.paddings["2sm"],
        alignItems: "center",
        flex: 1,
        paddingHorizontal: sizes.paddings["1md"],
    }

    const title: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family["Bold"],
        color: colors.gray.white,
    }

    const contentContainer: ViewStyle = {
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1md"],
        backgroundColor: colors.gray.grey_08,
        marginBottom: sizes.margins["1md"],
        alignItems: "center",
        justifyContent: "center",
    }

    const description: TextStyle = {
        marginTop: sizes.margins["2sm"],
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        textAlign: "center",
    }

    const button_text: TextStyle = {
        fontSize: fonts.size.body * 1.1,
        fontFamily: fonts.family["Black-Italic"],
        color: colors.gray.white,
    }

    async function handlePress() {
        Alert.alert(
            t("Log Out Confirmation"),
            t("Are you sure you want to log out?"),
            [
                {
                    text: t("Stay Logged In"),
                    style: "cancel",
                },
                {
                    text: t("Log Out"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const hasHardware = await LocalAuthentication.hasHardwareAsync()
                            const isEnrolled = await LocalAuthentication.isEnrolledAsync()
                            if (hasHardware && isEnrolled) {
                                const isAuthenticated = await LocalAuthentication.authenticateAsync(
                                    {
                                        biometricsSecurityLevel: "weak",
                                        cancelLabel: t("Stay Logged In"),
                                        promptMessage: t("Log Out Confirmation"),
                                    },
                                )
                                if (isAuthenticated) {
                                    signOut()
                                }
                            } else {
                                // Sem biometria disponível, prosseguir com logout após confirmação
                                signOut()
                            }
                        } catch (err: any) {
                            console.error(err)
                        }
                    },
                },
            ],
            { cancelable: true },
        )
    }

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={contentContainer}>
                <Text style={title}>{t("Are you sure you want to log out?")}</Text>
                <Text style={description}>
                    {t("You will not be able to recover your account if you forget your password.")}
                </Text>
            </View>
            <ButtonStandart
                bounciness={5}
                animationScale={0.93}
                borderRadius={50}
                margins={false}
                height={46}
                action={handlePress}
                backgroundColor={colors.red.red_05.toString()}
            >
                <Text style={button_text}>{t("Log Out Anyway")}</Text>
            </ButtonStandart>
        </View>
    )
}
