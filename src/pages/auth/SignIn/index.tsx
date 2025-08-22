import Icon from "@/assets/icons/svgs/arrow_circle_right.svg"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import { useTranslation } from "react-i18next"
import { StatusBar, StyleProp, TextStyle, useColorScheme, View, ViewStyle } from "react-native"
import PasswordInput from "../../../components/auth/passwordInput"
import AuthTermsText from "../../../components/auth/terms"
import UsernameInput from "../../../components/auth/usernameInput"
import ButtonStandart from "../../../components/buttons/button-standart"
import ButtonClose from "../../../components/buttons/close"
import { Loading } from "../../../components/loading"
import { Text } from "../../../components/Themed"
import ColorTheme, { colors } from "../../../constants/colors"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import AuthContext from "../../../contexts/Auth"

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
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color:
            signInputUsername && signInputPassword && !loading
                ? colors.gray.white
                : isDarkMode
                ? colors.gray.grey_04 + "90"
                : colors.gray.grey_04 + "90",
    }
    const icon = {
        marginLeft: sizes.margins["2sm"],
        top: 0.4,
    }

    const errorContainer: StyleProp<ViewStyle> = {
        marginTop: -sizes.margins["2sm"],
        marginBottom: sizes.margins["1md"],
    }

    const errorText: StyleProp<TextStyle> = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: isDarkMode ? colors.red.red_05 : colors.red.red_05,
    }

    function handlePress() {
        if (!loading && signInputUsername && signInputPassword) signIn()
    }
    React.useEffect(() => {
        setErrorMessage("")
    }, [])

    return (
        <View style={container}>
            <StatusBar backgroundColor={colors.gray.black} barStyle={"light-content"} />
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
                <Text style={description}>
                    {t("Chose a name to be your identity in community")}
                </Text>
                <Text style={subDescription}>{t("You can't change it later.")}</Text>
                <View style={{ marginBottom: sizes.margins["1md"] }}>
                    <UsernameInput type="signIn" />
                </View>
                <PasswordInput type="signIn" />
            </View>

            {errorMessage && (
                <View testID="error-container" style={errorContainer}>
                    <Text testID="error-message" style={errorText}>
                        Error: {errorMessage}
                    </Text>
                </View>
            )}
            <ButtonStandart
                testID="handle-submit"
                margins={false}
                action={handlePress}
                backgroundColor={
                    signInputPassword && signInputUsername && !loading
                        ? ColorTheme().primary.toString()
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
                        <Text style={[button_text, { marginRight: 4 }]}>Loading</Text>
                        <Loading.ActivityIndicator size={15} />
                    </View>
                ) : (
                    <>
                        <Text style={button_text} testID="handle-submit-text">
                            Enter Now
                        </Text>
                        <Icon
                            style={icon}
                            fill={String(
                                signInputPassword && signInputUsername && !loading
                                    ? colors.gray.white
                                    : isDarkMode
                                    ? colors.gray.grey_04 + "90"
                                    : colors.gray.grey_04 + "90",
                            )}
                            width={17}
                            height={17}
                        />
                    </>
                )}
            </ButtonStandart>

            <View testID="auth-terms" style={{ marginTop: sizes.margins["1xl"] }}>
                <AuthTermsText signText="Enter Now" />
            </View>
        </View>
    )
}
