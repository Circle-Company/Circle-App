import React from "react"
import { View, ViewStyle, TextStyle, Alert } from "react-native"
import { useRouter } from "expo-router"
import * as LocalAuthentication from "expo-local-authentication"
import ButtonStandart from "@/components/buttons/button-standart"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { Text } from "@/components/Themed"
import AuthContext from "@/contexts/auth"
import LanguageContext from "@/contexts/language"

export default function LogOutScreen() {
    const router = useRouter()
    const { t } = React.useContext(LanguageContext)
    const { signOut } = React.useContext(AuthContext)

    const container: ViewStyle = {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        backgroundColor: colors.gray.grey_08,
        paddingVertical: sizes.paddings["1lg"] * 0.8,
        borderRadius: sizes.borderRadius["1lg"] * 1.2,
        paddingHorizontal: sizes.paddings["1md"] * 0.8,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1md"],
    }

    const title: TextStyle = {
        fontSize: fonts.size.title3 * 0.9,
        fontFamily: fonts.family.Bold,
        fontStyle: "italic",
        marginBottom: sizes.margins["2sm"],
        textAlign: "center",
    }

    const description: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
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
        backgroundColor: colors.red.red_05,
    }

    const buttonLabel: any = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body * 1.2,
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
                    onPress: () => {
                        router.back()
                    },
                },
                {
                    text: t("Log Out"),
                    style: "destructive",
                    onPress: async () => {
                        const hasHardware = await LocalAuthentication.hasHardwareAsync()
                        const isEnrolled = await LocalAuthentication.isEnrolledAsync()

                        if (hasHardware && isEnrolled) {
                            const result = await LocalAuthentication.authenticateAsync({
                                biometricsSecurityLevel: "weak",
                                cancelLabel: t("Stay Logged In"),
                                promptMessage: t("Log Out Confirmation"),
                            })

                            if (result.success) signOut()
                        } else signOut()
                    },
                },
            ],
            { cancelable: true },
        )
    }

    return (
        <View style={container}>
            <Text style={title}>{t("Are you sure you want to log out?")}</Text>
            <Text style={description}>
                {t("You will not be able to recover your account if you forget your password.")}
            </Text>
            <ButtonStandart
                style={buttonContainer}
                bounciness={5}
                animationScale={0.93}
                borderRadius={50}
                margins={false}
                height={46}
                action={handlePress}
                backgroundColor={colors.red.red_05.toString()}
            >
                <Text style={buttonLabel}>{t("Log Out Anyway")}</Text>
            </ButtonStandart>
        </View>
    )
}
