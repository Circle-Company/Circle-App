import Icon from "@/assets/icons/svgs/arrow_circle_right.svg"
import { Text, View } from "@/components/Themed"
import PasswordInputSignIn from "@/components/auth/password_input-sign_in"
import AuthTermsText from "@/components/auth/terms"
import UsernameInputSignIn from "@/components/auth/username_input-sign_in"
import ButtonStandart from "@/components/buttons/button-standart"
import { Loading } from "@/components/loading"
import AuthContext from "@/contexts/Auth"
import ColorTheme, { colors } from "@/layout/constants/colors"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"
import React from "react"
import { StatusBar, useColorScheme } from "react-native"

export default function SignInScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { signIn, setErrorMessage, signInputUsername, signInputPassword, loading, errorMessage } =
        React.useContext(AuthContext)

    const container = {
        marginTop: sizes.margins["1xxl"] * 0.9,
        flex: 1,
        alignItems: "center",
    }
    const input_container = {
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
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={input_container}>
                <View style={{ marginBottom: sizes.margins["1md"] }}>
                    <UsernameInputSignIn />
                </View>
                <PasswordInputSignIn />
            </View>

            {errorMessage && (
                <View style={errorContainer}>
                    <Text style={errorText}>Error: {errorMessage}</Text>
                </View>
            )}
            <ButtonStandart
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
                        <Text style={button_text}>Enter Now</Text>
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

            <View style={{ marginTop: sizes.margins["1xl"] }}>
                <AuthTermsText signText="Enter Now" />
            </View>
        </View>
    )
}
