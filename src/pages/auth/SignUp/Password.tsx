import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import Icon from "../../../assets/icons/svgs/plus_circle.svg"
import PasswordInput from "../../../components/auth/password_input"
import AuthTermsText from "../../../components/auth/terms"
import ButtonStandart from "../../../components/buttons/button-standart"
import { Text, View } from "../../../components/Themed"
import AuthContext from "../../../contexts/auth"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function PasswordScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { signUp, signInputPassword } = React.useContext(AuthContext)

    const container = {
        flex: 1,
        alignItems: "center",
    }

    const input_container = {
        alignItems: "center",
        paddingTop: sizes.paddings["1xxl"] * 0.6,
        paddingBottom: sizes.paddings["1xl"] * 0.8,
    }

    const description = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
        marginBottom: sizes.margins["1md"],
    }

    const button_text = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: signInputPassword
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
        if (signInputPassword) {
            signUp()
        }
    }

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <View style={input_container}>
                <Text style={description}>You can't get it back if you forget it.</Text>
                <PasswordInput />
            </View>
            <ButtonStandart
                margins={false}
                width={sizes.buttons.width / 2.05}
                height={40}
                action={handlePress}
                backgroundColor={
                    signInputPassword
                        ? ColorTheme().primary.toString()
                        : ColorTheme().backgroundDisabled.toString()
                }
            >
                <Text style={button_text}>Create Account</Text>
                <Icon
                    style={icon}
                    fill={String(
                        signInputPassword
                            ? colors.gray.white
                            : isDarkMode
                              ? colors.gray.grey_04 + "90"
                              : colors.gray.grey_04 + "90"
                    )}
                    width={17}
                    height={17}
                />
            </ButtonStandart>

            <View style={{ marginTop: sizes.margins["1xl"] * 0.8 }}>
                <AuthTermsText signText='"Create Account"' />
            </View>
        </View>
    )
}
