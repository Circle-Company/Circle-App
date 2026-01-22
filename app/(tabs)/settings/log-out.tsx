import React from "react"
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Alert } from "react-native"
import { useRouter } from "expo-router"
import * as LocalAuthentication from "expo-local-authentication"
import ButtonStandart from "@/components/buttons/button-standart"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import AuthContext from "@/contexts/auth"
import LanguageContext from "@/contexts/language"

export default function LogOutScreen() {
    const router = useRouter()
    const { t } = React.useContext(LanguageContext)
    const { signOut } = React.useContext(AuthContext)

    console.log("🔐 LogOutScreen montado - signOut disponível:", !!signOut)

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
        console.log("🔘 Botão de logout pressionado - mostrando confirmação")

        Alert.alert(
            t("Log Out Confirmation"),
            t("Are you sure you want to log out?"),
            [
                {
                    text: t("Stay Logged In"),
                    style: "cancel",
                    onPress: () => {
                        console.log("❌ Logout cancelado pelo usuário")
                    },
                },
                {
                    text: t("Log Out"),
                    style: "destructive",
                    onPress: async () => {
                        console.log("✅ Logout confirmado - iniciando processo")
                        try {
                            const hasHardware = await LocalAuthentication.hasHardwareAsync()
                            const isEnrolled = await LocalAuthentication.isEnrolledAsync()

                            console.log(
                                `🔐 Biometria - Hardware: ${hasHardware}, Enrolled: ${isEnrolled}`,
                            )

                            if (hasHardware && isEnrolled) {
                                console.log("🔐 Solicitando autenticação biométrica...")
                                const result = await LocalAuthentication.authenticateAsync({
                                    biometricsSecurityLevel: "weak",
                                    cancelLabel: t("Stay Logged In"),
                                    promptMessage: t("Log Out Confirmation"),
                                })

                                console.log(`🔐 Resultado biometria - Sucesso: ${result.success}`)

                                if (result.success) {
                                    console.log("✅ Biometria autenticada - chamando signOut()")
                                    signOut()
                                    console.log("✅ signOut() chamado com sucesso")
                                } else {
                                    console.log("❌ Biometria falhou - logout cancelado")
                                }
                            } else {
                                // Sem biometria disponível, prosseguir com logout após confirmação
                                console.log(
                                    "⚠️ Sem biometria disponível - chamando signOut() direto",
                                )
                                signOut()
                                console.log("✅ signOut() chamado com sucesso")
                            }
                        } catch (err: any) {
                            console.error("❌ Erro durante processo de logout:", err)
                        }
                    },
                },
            ],
            { cancelable: true },
        )
    }

    return (
        <View style={container}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-start" }}>
                <View style={contentContainer}>
                    <Text style={title}>{t("Are you sure you want to log out?")}</Text>
                    <Text style={description}>
                        {t(
                            "You will not be able to recover your account if you forget your password.",
                        )}
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
            <View style={styles.footer}>
                <TouchableOpacity onPress={() => router.push("/(tabs)/settings/exclude-account")}>
                    <Text style={styles.deleteText}>
                        {t("I want to delete my Circle account.")}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        paddingBottom: sizes.screens.height * 0.2,
        alignItems: "center",
    },
    deleteText: {
        color: "#888",
        textDecorationLine: "underline",
        fontSize: 14,
    },
})
