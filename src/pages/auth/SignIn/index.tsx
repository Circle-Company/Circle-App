import { Loading } from "@/components/loading"
import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import Icon from "../../../assets/icons/svgs/arrow_circle_right.svg"
import { Text, View } from "../../../components/Themed"
import PasswordInputSignIn from "../../../components/auth/password_input-sign_in"
import AuthTermsText from "../../../components/auth/terms"
import UsernameInputSignIn from "../../../components/auth/username_input-sign_in"
import ButtonStandart from "../../../components/buttons/button-standart"
import AuthContext from "../../../contexts/auth"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function SignInScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { signIn, signInputUsername, signInputPassword, loading } = React.useContext(AuthContext)

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
            signInputUsername && signInputPassword
                ? colors.gray.white
                : isDarkMode
                  ? colors.gray.grey_04 + "90"
                  : colors.gray.grey_04 + "90",
    }
    const icon = {
        marginLeft: sizes.margins["2sm"],
        top: 0.4,
    }

    function handlePress() {
        if (!loading && signInputUsername && signInputPassword) signIn()
    }

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
            <ButtonStandart
                margins={false}
                width={sizes.buttons.width / 2.7}
                height={40}
                action={handlePress}
                backgroundColor={
                    signInputPassword && signInputUsername
                        ? ColorTheme().primary.toString()
                        : ColorTheme().backgroundDisabled.toString()
                }
            >
                {loading ? (
                    <>
                        <Text style={button_text}>Loading</Text>
                        <Loading.ActivityIndicator />
                    </>
                ) : (
                    <>
                        <Text style={button_text}>Enter Now</Text>
                        <Icon
                            style={icon}
                            fill={String(
                                signInputPassword && signInputUsername
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
