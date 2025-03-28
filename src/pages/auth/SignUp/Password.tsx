import { Loading } from "@/components/loading"
import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import Icon from "../../../assets/icons/svgs/plus_circle.svg"
import { Text, View } from "../../../components/Themed"
import PasswordInput from "../../../components/auth/password_input"
import AuthTermsText from "../../../components/auth/terms"
import ButtonStandart from "../../../components/buttons/button-standart"
import AuthContext from "../../../contexts/Auth"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function PasswordScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { signUp, setErrorMessage, signInputPassword, errorMessage, loading } =
        React.useContext(AuthContext)

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
        color:
            signInputPassword && !loading
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
        if (signInputPassword) {
            signUp()
        }
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
                <Text style={description}>You can't get it back if you forget it.</Text>
                <PasswordInput />
            </View>
            {errorMessage && (
                <View style={errorContainer}>
                    <Text style={errorText}>{errorMessage}</Text>
                </View>
            )}
            <ButtonStandart
                margins={false}
                width={sizes.buttons.width / 2.05}
                height={40}
                action={handlePress}
                backgroundColor={
                    signInputPassword && !loading
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
                        <Text style={button_text}>Create Account</Text>
                        <Icon
                            style={icon}
                            fill={String(
                                signInputPassword && !loading
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

            <View style={{ marginTop: sizes.margins["1xl"] * 0.8 }}>
                <AuthTermsText signText='"Create Account"' />
            </View>
        </View>
    )
}
