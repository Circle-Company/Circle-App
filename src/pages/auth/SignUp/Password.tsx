import ColorTheme, { colors } from "@/constants/colors"
import { StyleProp, TextStyle, View, ViewStyle, useColorScheme } from "react-native"
import AuthContext from "@/contexts/Auth"
import ButtonClose from "@/components/buttons/close"
import ButtonStandart from "@/components/buttons/button-standart"
import { LinearGradient } from "expo-linear-gradient"
import { Loading } from "@/components/loading"
import NextIcon from "@/assets/icons/svgs/arrow_circle_right.svg"
import PasswordInput from "@/components/auth/passwordInput"
import React from "react"
import { Text } from "@/components/Themed"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useTranslation } from "react-i18next"

export default function PasswordScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const router = useRouter()
    const { t } = useTranslation()
    const { setErrorMessage, signInputPassword, errorMessage, loading } =
        React.useContext(AuthContext)

    const container: StyleProp<ViewStyle> = {
        flex: 1,
        alignItems: "center",
    }

    const headerContainer: any = {
        marginTop: sizes.margins["2sm"],
        width: sizes.screens.width,
        height: sizes.headers.height * 0.7,
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1md"],
        justifyContent: "center",
        alignItems: "center",
        marginBottom: sizes.margins["1xl"] * 0.8,
        backgroundColor: "transparent",
    }
    const headerTitle: any = {
        fontSize: fonts.size.title3,
        fontFamily: fonts.family["Black-Italic"],
        alignSelf: "center",
        marginLeft: -35,
        backgroundColor: "transparent",
    }

    const input_container: any = {
        alignItems: "center",
        paddingBottom: sizes.paddings["1xl"] * 0.8,
        backgroundColor: "transparent",
    }

    const description: TextStyle = {
        fontSize: fonts.size.title2 * 1.2,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text,
        marginBottom: sizes.margins["2sm"],
        marginHorizontal: sizes.margins["1lg"],
        textAlign: "center",
    }

    const subDescription: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text + 90,
        marginBottom: sizes.margins["1xl"] * 1.2,
        paddingHorizontal: sizes.margins["2md"],
        textAlign: "center",
    }

    const button_text: StyleProp<TextStyle> = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family["Black-Italic"],
        color:
            signInputPassword && signInputPassword.length >= 4 && !loading
                ? colors.gray.white
                : isDarkMode
                  ? colors.gray.grey_04 + "90"
                  : colors.gray.grey_04 + "90",
    }

    const icon: StyleProp<ViewStyle> = {
        marginLeft: sizes.margins["2sm"],
        top: 0.4,
    }

    const errorContainer: StyleProp<ViewStyle> = {
        marginTop: -sizes.margins["1sm"],
        marginBottom: sizes.margins["1md"],
    }

    const errorText: StyleProp<TextStyle> = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: isDarkMode ? colors.red.red_05 : colors.red.red_05,
    }
    const inferior_gradient: ViewStyle = {
        width: sizes.window.width,
        alignSelf: "flex-start",
        flex: 1,
        height: sizes.window.height - 500,
        position: "absolute",
        zIndex: 0,
        top: -10,
        opacity: 0.4,
    }

    function handlePress() {
        if (signInputPassword && signInputPassword.length >= 4) {
            router.push("/(auth)/sign-up-agree")
        }
    }

    React.useEffect(() => {
        setErrorMessage("")
    }, [])

    return (
        <SafeAreaView style={container} edges={["top", "bottom"]}>
            <LinearGradient
                renderToHardwareTextureAndroid
                colors={["rgba(70, 70, 70, 1)", "#000000ff"]}
                style={inferior_gradient}
            />
            <View style={headerContainer}>
                <ButtonClose />
                <View style={{ flex: 1 }}>
                    <Text style={headerTitle} testID="title">
                        {t("Step 2 of 3")}
                    </Text>
                </View>
            </View>

            <View style={input_container}>
                <Text style={description}>{t("Circle is safety")}</Text>
                <Text style={subDescription}>
                    {t(
                        "For your account security, your password cannot be recovered if you forgot it.",
                    )}
                </Text>

                <PasswordInput type="signUp" />
            </View>
            {errorMessage && (
                <View style={errorContainer}>
                    <Text style={errorText}>{errorMessage}</Text>
                </View>
            )}

            <ButtonStandart
                testID="handle-submit"
                margins={false}
                action={handlePress}
                backgroundColor={
                    signInputPassword.length >= 4
                        ? ColorTheme().primary.toString()
                        : ColorTheme().backgroundDisabled
                }
            >
                {loading ? (
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#00000000",
                        }}
                    >
                        <Text style={[button_text, { marginRight: 4 }]}>{t("Loading")}</Text>
                        <Loading.ActivityIndicator size={15} />
                    </View>
                ) : (
                    <>
                        <Text style={button_text}>{t("Next Step")}</Text>
                        <NextIcon
                            style={icon}
                            fill={String(
                                signInputPassword.length >= 4
                                    ? colors.gray.white
                                    : isDarkMode
                                      ? colors.gray.grey_04 + 99
                                      : colors.gray.grey_04 + 99,
                            )}
                            width={17}
                            height={17}
                        />
                    </>
                )}
            </ButtonStandart>
        </SafeAreaView>
    )
}
