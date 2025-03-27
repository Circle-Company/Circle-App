import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Image, StatusBar, View, useColorScheme } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Icon from "../../../assets/icons/svgs/arrow_circle_right.svg"
import { Text } from "../../../components/Themed"
import Button from "../../../components/buttons/button-standart"
import config from "../../../config"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { default as Fonts, default as fonts } from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function SplashScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const navigation: any = useNavigation()

    const container: any = {
        flex: 1,
        backgroundColor: ColorTheme().background,
    }
    const header: any = {
        alignitems: "center",
        alignSelf: "center",
        justifyContent: "center",
        position: "absolute",
        top: 70,
        color: colors.gray.white,
        zIndex: 2,
    }
    const center: any = {
        alignItems: "center",
        position: "absolute",
        justifyContent: "center",
        bottom: 150,
        left: -30,
        zIndex: 2,
    }
    const title: any = {
        alignSelf: "center",
        fontFamily: Fonts.family["Black-Italic"],
        fontSize: 48,
        color: colors.gray.white,
        marginBottom: 10,
    }
    const slogan: any = {
        fontFamily: Fonts.family["Semibold-Italic"],
        alignSelf: "center",
        textAlign: "center",
        fontSize: fonts.size.subheadline,
        color: colors.gray.white,
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
        marginTop: sizes.margins["1lg"],
        marginBottom: sizes.margins["1xl"] * 0.95,
        alignItems: "center",
        justifyContent: "center",
    }
    const primaryActionText: any = {
        fontSize: fonts.size.body * 1.2,
        fontFamily: fonts.family["Bold-Italic"],
        color: colors.gray.black,
        marginRight: sizes.margins["2md"],
    }

    const secundaryActionText: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white + 99,
    }

    const inferior_gradient: any = {
        width: sizes.window.width,
        height: sizes.window.height / 1.8,
        position: "absolute",
        zIndex: 1,
        bottom: 0,
    }

    const superior_gradient: any = {
        width: sizes.window.width,
        height: sizes.window.height / 2,
        position: "absolute",
        zIndex: 1,
        top: 0,
    }

    return (
        <View style={container}>
            <StatusBar translucent barStyle={"light-content"} backgroundColor={colors.gray.black} />
            <Image
                style={{ width: sizes.window.width, height: sizes.window.height, opacity: 0.9 }}
                resizeMode="cover"
                source={require("../../../assets/images/bg/bg4.jpg")}
            />
            <LinearGradient colors={["#00000000", "#000000"]} style={inferior_gradient} />
            <LinearGradient colors={["#000000", "#00000000"]} style={superior_gradient} />
            <View style={header}>
                <Text style={title}>{config.APPLICATION_SHORT_NAME}</Text>
                <Text style={slogan}>{config.APPLICATION_DESCRIPTION}</Text>
            </View>
            <View style={center} />

            <View style={buttons}>
                <Button
                    action={() => {
                        navigation.navigate("Auth-SignIn")
                    }}
                    backgroundColor={"#00000000"}
                    width={200}
                    height={20}
                >
                    <Text style={secundaryActionText}>Already have a account</Text>
                </Button>
                <View style={primaryActionContainer}>
                    <Button
                        action={() => {
                            navigation.navigate("Auth-SignUp-Username")
                        }}
                        backgroundColor={colors.gray.white.toString()}
                        bounciness={10}
                        width={300}
                        height={70}
                    >
                        <Text style={primaryActionText}>Create Account</Text>
                        <Icon width={26} height={26} fill={colors.gray.black.toString()} />
                    </Button>
                </View>
            </View>
        </View>
    )
}
