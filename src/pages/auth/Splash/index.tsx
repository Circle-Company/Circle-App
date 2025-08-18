import Icon from "@/assets/icons/svgs/arrow_circle_right.svg"
import LogoIcon from "@/assets/icons/svgs/circle-icon-logo.svg"
import Button from "@/components/buttons/button-standart"
import { LanguageSelector } from "@/components/language/selector"
import { Text } from "@/components/Themed"
import config from "@/config"
import ColorTheme, { colors } from "@/constants/colors"
import { default as Fonts, default as fonts } from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import { useTranslation } from "react-i18next"
import { SafeAreaView, StatusBar, View, ViewStyle } from "react-native"

export default function SplashScreen() {
    const navigation: any = useNavigation()
    const { t } = useTranslation()

    const container: any = {
        flex: 1,
        alignItems: "center",
        backgroundColor: ColorTheme().background,
    }
    const header: any = {
        top: 100,
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        color: colors.gray.white,
        zIndex: 1,
    }
    const langugageContainer: ViewStyle = {
        marginTop: sizes.margins["1xl"],
        width: sizes.screens.width,
        height: sizes.headers.height * 0.5,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    }
    const title: any = {
        alignSelf: "center",
        fontFamily: Fonts.family["Black-Italic"],
        fontSize: 48,
        color: colors.gray.white,
        marginBottom: -5,
        elevation: 10,
    }
    const slogan: any = {
        fontFamily: Fonts.family["Semibold-Italic"],
        alignSelf: "center",
        textAlign: "center",
        fontSize: fonts.size.subheadline * 0.9,
        color: colors.gray.grey_04,
    }
    const buttons: any = {
        alignItems: "center",
        position: "absolute",
        justifyContent: "center",
        bottom: 0,
        zIndex: 2,
    }

    const primaryActionContainer: any = {
        width: sizes.screens.width,
        height: sizes.headers.height,
        marginTop: sizes.margins["2sm"],
        marginBottom: sizes.margins["1xxl"],
        alignItems: "center",
        justifyContent: "center",
    }
    const primaryActionText: any = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family["Bold-Italic"],
        color: colors.gray.black,
        marginRight: sizes.margins["3sm"],
    }

    const secundaryActionText: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family["Semibold-Italic"],
        color: colors.purple.purple_00,
        textDecorationLine: "underline",
    }

    const superior_gradient: any = {
        width: sizes.window.width,
        height: sizes.window.height / 2,
        position: "absolute",
        zIndex: 1,
        top: 0,
        opacity: 0.55,
    }

    const inferior_gradient: any = {
        width: sizes.window.width,
        height: sizes.window.height / 2,
        position: "absolute",
        zIndex: 1,
        bottom: 0,
        opacity: 0,
    }

    const logoContainer: ViewStyle = {
        marginBottom: sizes.margins["1md"],
        width: 190,
        height: 190,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    }
    const iconGradient: any = {
        width: 190,
        height: 190,
        position: "absolute",
        zIndex: 0,
        top: 0,
    }

    return (
        <SafeAreaView style={container}>
            <StatusBar barStyle={"light-content"} backgroundColor={colors.gray.black} />
            <LinearGradient
                renderToHardwareTextureAndroid
                colors={["rgba(42, 42, 42, 1)", "#00000000"]}
                style={superior_gradient}
            />

            <LinearGradient
                renderToHardwareTextureAndroid
                colors={["#00000000", colors.purple.purple_09]}
                style={inferior_gradient}
            />

            <View style={langugageContainer}>
                <LanguageSelector />
            </View>

            <View style={header}>
                <View style={logoContainer}>
                    <LinearGradient
                        renderToHardwareTextureAndroid
                        colors={[colors.purple.purple_04, colors.purple.purple_08]}
                        style={iconGradient}
                    />
                    <LogoIcon fill="#edddffff" width={100} height={100} />
                </View>
                <Text style={title}>{config.APPLICATION_NAME}</Text>
                <Text style={slogan}>{config.APPLICATION_DESCRIPTION}</Text>
            </View>

            <View style={buttons}>
                <Button
                    action={() => {
                        navigation.navigate("Auth-SignIn")
                    }}
                    margins={false}
                    style={{
                        marginBottom: 0,
                    }}
                    backgroundColor={"#00000000"}
                >
                    <Text style={secundaryActionText}>{t("Sign In with Circle")}</Text>
                </Button>
                <View style={primaryActionContainer}>
                    <Button
                        action={() => {
                            navigation.navigate("Auth-SignUp-Username")
                        }}
                        style={{ paddingHorizontal: sizes.paddings["1lg"] }}
                        margins={false}
                        backgroundColor={colors.gray.white.toString()}
                        bounciness={10}
                        height={60}
                    >
                        <Text style={primaryActionText}>{t("Create Account")}</Text>
                        <Icon width={26} height={26} fill={colors.gray.black.toString()} />
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    )
}
