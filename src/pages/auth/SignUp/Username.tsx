import NextIcon from "@/assets/icons/svgs/arrow_circle_right.svg"
import UsernameInput from "@/components/auth/usernameInput"
import ButtonStandart from "@/components/buttons/button-standart"
import ButtonClose from "@/components/buttons/close"
import { Text } from "@/components/Themed"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import AuthContext from "@/contexts/Auth"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { t } from "i18next"
import React from "react"
import { StatusBar, View, useColorScheme } from "react-native"

export default function UsernameScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const { signInputUsername, setErrorMessage, setSignInputPassword, setSignInputUsername } =
        React.useContext(AuthContext)
    const navigation: any = useNavigation()

    const container: any = {
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

    const description: any = {
        fontSize: fonts.size.title3,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text,
        marginBottom: sizes.margins["2sm"],
        marginHorizontal: sizes.margins["1lg"],
        textAlign: "center",
    }

    const subDescription: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().text + 90,
        marginBottom: sizes.margins["1xl"] * 1.2,
    }

    const inferior_gradient: any = {
        width: sizes.window.width,
        alignSelf: "flex-start",
        flex: 1,
        height: sizes.window.height - 500,
        position: "absolute",
        zIndex: 0,
        top: -10,
        opacity: 0.4,
    }
    const button_text: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family["Bold-Italic"],
        color: signInputUsername
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
        if (signInputUsername) {
            navigation.navigate("Auth-SignUp-Password")
        }
    }

    React.useEffect(() => {
        setSignInputUsername("")
        setSignInputPassword("")
        setErrorMessage("")
    }, [])

    return (
        <View style={container}>
            <StatusBar backgroundColor={"transparent"} barStyle={"light-content"} />
            <LinearGradient
                renderToHardwareTextureAndroid
                colors={["rgba(70, 70, 70, 1)", "#000000ff"]}
                style={inferior_gradient}
            />
            <View style={headerContainer} testID="header-container">
                <ButtonClose />
                <View style={{ flex: 1, alignSelf: "center" }}>
                    <Text style={headerTitle} testID="header-title">
                        {t("Step 1 of 3")}
                    </Text>
                </View>
            </View>

            <View style={input_container} testID="input-container">
                <Text style={description}>
                    {t("Chose a name to be your identity in community")}
                </Text>
                <Text style={subDescription}>{t("You can't change it later.")}</Text>
                <UsernameInput type="signUp" />
            </View>
            <ButtonStandart
                testID="handle-submit"
                margins={false}
                action={handlePress}
                backgroundColor={
                    signInputUsername.length > 0
                        ? ColorTheme().primary.toString()
                        : ColorTheme().backgroundDisabled
                }
            >
                <Text style={button_text}>{t("Next Step")}</Text>
                <NextIcon
                    style={icon}
                    fill={String(
                        signInputUsername
                            ? colors.gray.white
                            : isDarkMode
                            ? colors.gray.grey_04 + 99
                            : colors.gray.grey_04 + 99,
                    )}
                    width={17}
                    height={17}
                />
            </ButtonStandart>
        </View>
    )
}
