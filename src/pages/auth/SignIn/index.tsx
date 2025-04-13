import Icon from "@/assets/icons/svgs/arrow_circle_right.svg"
import { Text, View } from "@/components/Themed"
import PasswordInput from "@/components/auth/passwordInput"
import AuthTermsText from "@/components/auth/terms"
import UsernameInput from "@/components/auth/usernameInput"
import ButtonStandart from "@/components/buttons/button-standart"
import ButtonClose from "@/components/buttons/close"
import { Loading } from "@/components/loading"
import AuthContext from "@/contexts/Auth"
import ColorTheme, { colors } from "@/layout/constants/colors"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"
import React from "react"
import { StatusBar, StyleProp, TextStyle, ViewStyle, useColorScheme } from "react-native"

export default function SignInScreen() {
    const isDarkMode = useColorScheme() === "dark"
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

    const headerContainer: StyleProp<ViewStyle> = {
        width: sizes.screens.width,
        height: sizes.headers.height,
        flexDirection: "row",
        paddingHorizontal: sizes.paddings["1md"],
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: sizes.margins["1xl"] * 0.8,
    }
    const headerTitle: StyleProp<TextStyle> = {
        fontSize: fonts.size.title2,
        fontFamily: fonts.family.Bold,
    }
    const input_container: StyleProp<ViewStyle> = {
        alignItems: "center",
        paddingBottom: sizes.paddings["1xl"] * 0.8,
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

    const errorContainer: any = {
        marginTop: -sizes.margins["2sm"],
        marginBottom: sizes.margins["1md"],
    }

    const errorText: any = {
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
            <View style={headerContainer}>
                <ButtonClose />
                <View style={{ flex: 1, marginLeft: sizes.margins["2sm"] }}>
                    <Text style={headerTitle} testID="title">
                        Sign In
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
                        Error: {errorMessage}
                    </Text>
                </View>
            )}
            <ButtonStandart
                testID="handle-submit"
                margins={false}
                width={sizes.buttons.width / 2.7}
                height={40}
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
                                      : colors.gray.grey_04 + "90"
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
