import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Image, StatusBar, useColorScheme, View } from "react-native"
import Icon from "../../../assets/icons/svgs/arrow_circle_right.svg"
import { Text } from "../../../components/Themed"
import Button from "../../../components/buttons/button-standart"
import config from "../../../config"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { default as Fonts, default as fonts } from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function SplashScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const navigation = useNavigation()

    const container = {
        flex: 1,
        backgroundColor: ColorTheme().background,
    }
    const header = {
        alignitems: "center",
        alignSelf: "center",
        justifyContent: "center",
        position: "absolute",
        top: 70,
        color: ColorTheme().text,
    }
    const center = {
        alignItems: "center",
        position: "absolute",
        justifyContent: "center",
        bottom: 150,
        left: -30,
    }
    const title = {
        alignSelf: "center",
        fontFamily: Fonts.family["Black-Italic"],
        fontSize: 44,
        color: ColorTheme().text,
        marginBottom: 30,
    }
    const slogan = {
        fontFamily: Fonts.family["Semibold-Italic"],
        alignSelf: "center",
        textAlign: "center",
        fontSize: fonts.size.subheadline,
        color: ColorTheme().text,
    }
    const buttons = {
        alignItems: "center",
        position: "absolute",
        justifyContent: "center",
        bottom: 0,
    }

    const primaryActionContainer = {
        width: sizes.screens.width,
        height: sizes.headers.height,
        marginTop: sizes.margins["1md"],
        marginBottom: sizes.margins["1xl"] * 0.95,
        alignItems: "center",
        justifyContent: "center",
    }
    const primaryActionText = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
        marginRight: sizes.margins["1md"] * 0.8,
    }

    const secundaryActionText = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().primary,
    }

    return (
        <View style={container}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={ColorTheme().background.toString()}
            />
            <View style={header}>
                <Text style={title}>{config.APPLICATION_SHORT_NAME}</Text>
                <Text style={slogan}>{config.APPLICATION_DESCRIPTION}</Text>
            </View>
            <View style={center}>
                <Image
                    style={{ width: 454, height: 430 }}
                    resizeMode="contain"
                    source={require("../../../assets/images/bg/bg.png")}
                />
            </View>
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
                        backgroundColor={ColorTheme().primary.toString()}
                        width={200}
                        height={50}
                    >
                        <Text style={primaryActionText}>Create Account</Text>
                        <Icon width={24} height={24} fill={colors.gray.white.toString()} />
                    </Button>
                </View>
            </View>
        </View>
    )
}
