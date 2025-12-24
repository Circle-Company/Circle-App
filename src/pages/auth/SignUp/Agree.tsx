import ColorTheme, { colors } from "@/constants/colors"
import { StyleProp, TextStyle, View, ViewStyle, useColorScheme } from "react-native"
import StatusBar from "../../../components/StatusBar"

import AuthContext from "@/contexts/Auth"
import AuthTermsText from "@/components/auth/terms"
import ButtonClose from "@/components/buttons/close"
import ButtonStandart from "@/components/buttons/button-standart"
import CheckIcon from "@/assets/icons/svgs/check_circle.svg"
import { LinearGradient } from "expo-linear-gradient"
import { Loading } from "@/components/loading"
import React from "react"
import { Text } from "@/components/Themed"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { useTranslation } from "react-i18next"

export default function AgreeScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { t } = useTranslation()
    const { signUp, setErrorMessage, signInputPassword, errorMessage, loading } =
        React.useContext(AuthContext)

    const container: StyleProp<ViewStyle> = {
        flex: 1,
        alignItems: "center",
    }

    const headerContainer: any = {
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
        fontSize: fonts.size.title1 * 1.2,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text,
        marginBottom: sizes.margins["2sm"],
        marginHorizontal: sizes.margins["1lg"],
        textAlign: "center",
    }

    const subDescription: TextStyle = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        marginBottom: sizes.margins["1xl"] * 1.2,
        paddingHorizontal: sizes.margins["2md"],
        textAlign: "center",
    }

    const button_text: StyleProp<TextStyle> = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family["Black-Italic"],
        color: colors.gray.white,
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
            signUp()
        }
    }

    React.useEffect(() => {
        setErrorMessage("")
    }, [])

    return (
        <View style={container}>
            <StatusBar backgroundColor={colors.gray.black} barStyle="light-content" />
            <LinearGradient
                renderToHardwareTextureAndroid
                colors={["rgba(70, 70, 70, 1)", "#000000ff"]}
                style={inferior_gradient}
            />
            <View style={headerContainer}>
                <ButtonClose />
                <View style={{ flex: 1 }}>
                    <Text style={headerTitle} testID="title">
                        {t("Step 3 of 3")}
                    </Text>
                </View>
            </View>

            <View style={input_container}>
                <Text style={description}>{t("All Ready")} 🎉</Text>
                <Text style={subDescription}>{t("Just one small step to go...")}</Text>

                <AuthTermsText signText={t("Accept")} />
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
                    loading ? ColorTheme().backgroundDisabled : ColorTheme().primary.toString()
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
                        <Text style={[button_text, { marginRight: 6 }]}>{t("Loading")}</Text>
                        <Loading.ActivityIndicator color={colors.gray.white} size={12} />
                    </View>
                ) : (
                    <>
                        <Text style={button_text}>{t("Accept")}</Text>
                        <CheckIcon style={icon} fill={colors.gray.white} width={15} height={15} />
                    </>
                )}
            </ButtonStandart>
        </View>
    )
}
