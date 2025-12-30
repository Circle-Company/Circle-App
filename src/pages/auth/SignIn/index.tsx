import ColorTheme, { colors } from "../../../constants/colors"
import { StyleProp, TextStyle, View, ViewStyle, useColorScheme } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import AuthContext from "../../../contexts/Auth"
import AuthTermsText from "../../../components/auth/terms"
import ButtonClose from "../../../components/buttons/close"
import ButtonStandart from "../../../components/buttons/button-standart"
import { LinearGradient } from "expo-linear-gradient"
import { Loading } from "../../../components/loading"
import PasswordInput from "../../../components/auth/passwordInput"
import React from "react"
import { Text } from "../../../components/Themed"
import UsernameInput from "../../../components/auth/usernameInput"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import { useTranslation } from "react-i18next"

export default function SignInScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { t } = useTranslation()
    const {
        signIn,
        setErrorMessage,
        signInputUsername,
        signInputPassword,
        loading,
        errorMessage,
        setSignInputPassword,
        setSignInputUsername,
    } = React.useContext(AuthContext)

    React.useEffect(() => {
        setSignInputPassword("")
        setSignInputUsername("")
    }, [])

    const container: StyleProp<ViewStyle> = {
        flex: 1,
        alignItems: "center",
    }

    const headerContainer: ViewStyle = {
        width: sizes.screens.width,
        height: sizes.headers.height * 0.7,
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1md"],
        justifyContent: "center",
        alignItems: "center",
        marginTop: sizes.margins["2sm"],
        marginBottom: sizes.margins["1xl"] * 0.8,
        backgroundColor: "transparent",
    }
    const headerTitle: TextStyle = {
        fontSize: fonts.size.title3,
        fontFamily: fonts.family["Black-Italic"],
        alignSelf: "center",
        marginLeft: -35,
        backgroundColor: "transparent",
    }

    const input_container: ViewStyle = {
        alignItems: "center",
        paddingBottom: sizes.paddings["1xl"] * 0.8,
        backgroundColor: "transparent",
    }
    const description: TextStyle = {
        fontSize: fonts.size.title3,
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
    const button_text = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family["Black-Italic"],
        color:
            signInputUsername && signInputPassword && !loading
                ? colors.gray.black
                : isDarkMode
                  ? colors.gray.grey_04 + "90"
                  : colors.gray.grey_04 + "90",
    }

    const errorContainer: StyleProp<ViewStyle> = {
        marginTop: -sizes.margins["2sm"],
        marginBottom: sizes.margins["1md"],
        paddingHorizontal: sizes.paddings["1md"],
        alignItems: "center",
    }

    const errorText: StyleProp<TextStyle> = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: isDarkMode ? colors.red.red_05 : colors.red.red_05,
        textAlign: "center",
        marginBottom: sizes.margins["2sm"],
    }

    const errorActionText: StyleProp<TextStyle> = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family["Regular-Italic"],
        color: isDarkMode ? colors.gray.grey_04 : colors.gray.grey_06,
        textAlign: "center",
    }

    const authErrorKey = React.useMemo(() => {
        if (!errorMessage) return null
        const msg = String(errorMessage).toUpperCase()

        // Invalid credentials (case-insensitive and common codes)
        if (
            (msg.includes("INVALID") && (msg.includes("PASSWORD") || msg.includes("CREDENTIAL"))) ||
            msg.includes("INVALID_CREDENTIALS") ||
            msg.includes("INVALID_LOGIN_CREDENTIALS") ||
            msg.includes("UNAUTHORIZED") ||
            msg.includes("401")
        ) {
            return "auth.errors.invalidCredentials"
        }

        // User not found
        if (
            (msg.includes("USER") && msg.includes("NOT") && msg.includes("FOUND")) ||
            msg.includes("USER_NOT_FOUND")
        ) {
            return "auth.errors.userNotFound"
        }

        // Password/Username required
        if (
            (msg.includes("PASSWORD") && msg.includes("REQUIRED")) ||
            msg.includes("PASSWORD_REQUIRED")
        ) {
            return "auth.errors.passwordRequired"
        }
        if (
            ((msg.includes("USERNAME") || msg.includes("USER NAME")) && msg.includes("REQUIRED")) ||
            msg.includes("USERNAME_REQUIRED")
        ) {
            return "auth.errors.usernameRequired"
        }

        // Account status
        if (msg.includes("LOCK") || msg.includes("ACCOUNT_LOCKED")) {
            return "auth.errors.accountLocked"
        }
        if (msg.includes("DISABLE") || msg.includes("ACCOUNT_DISABLED")) {
            return "auth.errors.accountDisabled"
        }

        // Rate limit / too many requests
        if (
            msg.includes("TOO MANY") ||
            msg.includes("TOO_MANY") ||
            msg.includes("RATE LIMIT") ||
            msg.includes("RATE_LIMIT") ||
            msg.includes("TOO MANY REQUESTS") ||
            msg.includes("429")
        ) {
            return "auth.errors.tooManyRequests"
        }

        // Network/connectivity
        if (
            msg.includes("NETWORK") ||
            msg.includes("TIMEOUT") ||
            msg.includes("OFFLINE") ||
            msg.includes("ECONNABORTED") ||
            msg.includes("REQUEST TIMEOUT") ||
            msg.includes("REQUEST_TIMEOUT")
        ) {
            return "auth.errors.network"
        }

        return "auth.errors.generic"
    }, [errorMessage])

    const resolvedErrorText = React.useMemo(() => {
        if (!errorMessage) return ""
        const key = authErrorKey || "auth.errors.generic"
        const translated = t(key)
        // Fallback: if translation key is missing, show a generic localized title
        return translated === key ? t("Error") : translated
    }, [authErrorKey, errorMessage, t])

    function handlePress() {
        if (!loading && signInputUsername && signInputPassword) signIn()
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
                <View style={{ flex: 1, marginLeft: sizes.margins["2sm"] }}>
                    <Text style={headerTitle} testID="title">
                        {t("Wellcome Back")}
                    </Text>
                </View>
            </View>

            <View style={input_container} testID="inputs-container">
                <View style={{ marginBottom: sizes.margins["1md"] }}>
                    <UsernameInput type="signIn" />
                </View>
                <PasswordInput type="signIn" />
            </View>

            {errorMessage && (
                <View testID="error-container" style={errorContainer}>
                    <Text testID="error-message" style={errorText}>
                        {resolvedErrorText}
                    </Text>
                </View>
            )}
            <ButtonStandart
                testID="handle-submit"
                margins={false}
                action={handlePress}
                backgroundColor={
                    signInputPassword && signInputUsername && !loading
                        ? colors.gray.white
                        : ColorTheme().backgroundDisabled.toString()
                }
            >
                {loading ? (
                    <View
                        testID="handle-submit-loading"
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#00000000",
                        }}
                    >
                        <Text
                            style={[
                                button_text,
                                {
                                    marginRight: 4,
                                    color:
                                        signInputPassword && signInputUsername && !loading
                                            ? colors.gray.black
                                            : colors.gray.grey_05,
                                },
                            ]}
                        >
                            {t("Loading")}
                        </Text>
                        <Loading.ActivityIndicator size={15} />
                    </View>
                ) : (
                    <>
                        <Text style={button_text} testID="handle-submit-text">
                            {t("Enter on Circle")}
                        </Text>
                    </>
                )}
            </ButtonStandart>

            <View testID="auth-terms" style={{ marginTop: sizes.margins["1xl"] }}>
                <AuthTermsText signText={t("Enter Now")} />
            </View>
        </SafeAreaView>
    )
}
