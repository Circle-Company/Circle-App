import { colors } from "@/constants/colors"
import { default as Fonts, default as fonts } from "@/constants/fonts"
import { ViewStyle } from "react-native"
import { View, Image } from "react-native"
import Button from "@/components/buttons/button-standart"
import AppleLogo from "@/assets/icons/svgs/apple-logo.svg"
import { LanguageSelector } from "@/components/language/selector"
import { LinearGradient } from "expo-linear-gradient"
import * as AppleAuthentication from "expo-apple-authentication"
import { Text } from "@/components/Themed"
import config from "@/config"
import sizes from "@/constants/sizes"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { SafeAreaInsetsContext, useSafeAreaInsets } from "react-native-safe-area-context"
import AuthContext from "@/contexts/auth"
import React from "react"
import { isIPad11 } from "@/lib/platform/detection"
export default function SplashScreen() {
    const router = useRouter()
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()
    const { setAppleSignData, setErrorMessage, checkAppleAccountExists, appleSignIn, appleSignUp } =
        React.useContext(AuthContext)

    const container: any = {
        flex: 1,
        height: "100%",
        alignItems: "center",
        backgroundColor: colors.gray.black,
    }
    const header: any = {
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        color: colors.gray.white,
        zIndex: 1,
    }
    const langugageContainer: ViewStyle = {
        marginTop: sizes.margins["1xl"],
        width: sizes.screens.width,
        height: sizes.headers.height * 0.5,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    }
    const title: any = {
        alignSelf: "center",
        fontFamily: Fonts.family["Black-Italic"],
        fontSize: Fonts.size.title2 * 2.1,
        color: colors.gray.white,
        marginBottom: -5,
        elevation: 10,
    }
    const slogan: any = {
        fontFamily: Fonts.family["Semibold-Italic"],
        alignSelf: "center",
        textAlign: "center",
        marginTop: sizes.margins["2sm"],
        fontSize: fonts.size.subheadline,
        color: colors.gray.grey_04,
    }
    const buttons: any = {
        alignItems: "center",
        justifyContent: "center",
        bottom: 0,
        zIndex: 2,
    }

    const primaryActionContainer: any = {
        marginTop: sizes.margins["2sm"],
        marginBottom: sizes.margins["1xl"] * 1.3,
        alignItems: "center",
        justifyContent: "center",
    }
    const primaryActionText: any = {
        fontSize: fonts.size.body * 1.4,
        fontFamily: fonts.family["Black"],
        color: colors.gray.black,
        marginLeft: sizes.margins["2sm"],
    }

    const superior_gradient: any = {
        width: sizes.window.width,
        height: sizes.window.height,
        position: "absolute",
        zIndex: 0,
        top: 0,
        opacity: 0.08,
    }
    // Optional hero image just above the header (rendered only if provided)
    const heroImageSource = require("@/assets/images/illustrations/Init-Illustration.png")

    const heroContainer: ViewStyle = {
        width: sizes.screens.width,
        alignItems: "center",
        justifyContent: "center",
        marginTop: sizes.margins["1xl"],
        marginBottom: sizes.margins["1sm"],
    }

    const heroImage: any = {
        left: 3,
        height: sizes.screens.height * 0.55,
        overflow: "hidden",
    }

    async function SignWithApple() {
        try {
            const isAvailable = await AppleAuthentication.isAvailableAsync()
            if (!isAvailable) {
                setErrorMessage("Apple Sign In não está disponível neste dispositivo")
                return
            }

            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                ],
            })

            const authorizationCode = credential?.authorizationCode ?? ""
            const identityToken = credential?.identityToken ?? ""

            const user = credential?.user ?? ""
            const givenName = credential?.fullName?.givenName ?? ""
            const familyName = credential?.fullName?.familyName ?? ""
            const realUserStatus =
                typeof credential?.realUserStatus === "number" ? credential.realUserStatus : 0

            if (!authorizationCode || !identityToken || !user) {
                setErrorMessage("Não foi possível obter as credenciais da Apple. Tente novamente.")
                return
            }

            setAppleSignData({
                authorizationCode,
                identityToken,
                fullName: { givenName, familyName },
                realUserStatus,
                user,
            })

            const check = await checkAppleAccountExists(user)
            if (!check.success) {
                return
            }
            if (check.flow === "signup") {
                // Keep username step in the flow; navigate to username screen
                router.replace("/(auth)/sign-up-username")
            } else {
                await appleSignIn({
                    authorizationCode,
                    identityToken,
                    fullName: { givenName, familyName },
                    realUserStatus,
                    user,
                })
                router.replace("/(tabs)")
            }
        } catch (err: any) {
            if (err?.code === "ERR_CANCELED") {
                setErrorMessage("Operação cancelada pelo usuário.")
                return
            }
            setErrorMessage("Falha ao iniciar Sign in with Apple. Tente novamente.")
            console.log("Apple SignIn error:", err)
        }
    }

    return (
        <View style={container}>
            <LinearGradient
                renderToHardwareTextureAndroid
                colors={[colors.gray.grey_01, "#00000000"]}
                style={superior_gradient}
            />
            <SafeAreaInsetsContext value={insets}>
                <View style={{ paddingVertical: sizes.paddings["1md"], flex: 1 }}>
                    <View style={langugageContainer}>
                        <LanguageSelector />
                    </View>
                    <View style={heroContainer}>
                        <Image source={heroImageSource} style={heroImage} resizeMode="contain" />
                    </View>
                    <View style={header}>
                        <Text style={title}>{config.APPLICATION_NAME}</Text>
                        <Text style={slogan}>{t(config.APPLICATION_DESCRIPTION)}</Text>
                    </View>

                    <View
                        style={[
                            buttons,
                            { marginTop: isIPad11 ? sizes.margins["1xxl"] : sizes.margins["1lg"] },
                        ]}
                    >
                        <View style={primaryActionContainer}>
                            <Button
                                action={SignWithApple}
                                style={{
                                    paddingHorizontal: sizes.paddings["2md"],
                                }}
                                margins={false}
                                backgroundColor={colors.gray.white.toString()}
                                bounciness={10}
                                height={sizes.buttons.height * 0.9}
                            >
                                <AppleLogo
                                    style={{ top: -sizes.icons["1lg"].width * 0.05 }}
                                    width={sizes.icons["1lg"].width}
                                    height={sizes.icons["1lg"].width}
                                    fill={colors.gray.black.toString()}
                                />
                                <Text style={primaryActionText}>{t("Continue with Apple")}</Text>
                            </Button>
                        </View>
                        <View style={{ marginTop: sizes.margins["1sm"], alignItems: "center" }}>
                            <Text
                                style={{
                                    color: colors.gray.grey_05,
                                    fontSize: fonts.size.caption1,
                                    fontFamily: fonts.family.Medium,
                                }}
                            >
                                {config.ORGANIZATION_NAME}
                            </Text>
                        </View>
                    </View>
                </View>
            </SafeAreaInsetsContext>
        </View>
    )
}
