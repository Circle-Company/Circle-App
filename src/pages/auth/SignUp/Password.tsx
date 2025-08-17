import { StatusBar, StyleProp, TextStyle, ViewStyle, useColorScheme } from "react-native"
import { Text, View } from "../../../components/Themed"
import ColorTheme, { colors } from "../../../layout/constants/colors"

import ButtonClose from "@/components/buttons/close"
import { Loading } from "@/components/loading"
import React from "react"
import Icon from "../../../assets/icons/svgs/plus_circle.svg"
import PasswordInput from "../../../components/auth/passwordInput"
import AuthTermsText from "../../../components/auth/terms"
import ButtonStandart from "../../../components/buttons/button-standart"
import AuthContext from "../../../contexts/Auth"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function PasswordScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { signUp, setErrorMessage, signInputPassword, errorMessage, loading } =
        React.useContext(AuthContext)

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

    const description: StyleProp<TextStyle> = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text,
        marginBottom: sizes.margins["1md"],
    }

    const button_text: StyleProp<TextStyle> = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color:
            signInputPassword && !loading
                ? colors.gray.white
                : isDarkMode
<<<<<<< Updated upstream
                ? colors.gray.grey_04 + "90"
                : colors.gray.grey_04 + "90",
=======
                  ? colors.gray.grey_04 + "90"
                  : colors.gray.grey_04 + "90",
>>>>>>> Stashed changes
    }

    const icon: StyleProp<ViewStyle> = {
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
        if (signInputPassword) {
            signUp()
        }
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
                        Sign Up
                    </Text>
                </View>
            </View>

            <View style={input_container}>
                <Text style={description}>You can&apos;t get it back if you forget it.</Text>
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
<<<<<<< Updated upstream
                                    ? colors.gray.grey_04 + "90"
                                    : colors.gray.grey_04 + "90",
=======
                                      ? colors.gray.grey_04 + "90"
                                      : colors.gray.grey_04 + "90"
>>>>>>> Stashed changes
                            )}
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
