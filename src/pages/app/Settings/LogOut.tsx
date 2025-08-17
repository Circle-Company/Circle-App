import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import TouchID from "react-native-simple-biometrics"
import { Text, View } from "../../../components/Themed"
import ButtonStandart from "../../../components/buttons/button-standart"
import AuthContext from "../../../contexts/Auth"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"

export default function LogOutScreen() {
    const { t } = React.useContext(LanguageContext)
    const { signOut } = React.useContext(AuthContext)
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        paddingTop: sizes.paddings["2sm"],
        alignItems: "center",
        flex: 1,
    }

    const title = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
    }

    const descriptionContainer = {
        marginTop: sizes.margins["2sm"],
        marginBottom: sizes.margins["1md"],
        marginHorizontal: sizes.margins["2md"],
    }

    const description = {
        fontSize: fonts.size.body * 0.8,
        fontFamily: fonts.family.Medium,
        color: isDarkMode ? colors.gray.grey_04 : colors.gray.grey_06,
        textAlign: "justify",
    }

    const button_text = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
    }

    async function handlePress() {
        try {
            const isAuthenticated = await TouchID.requestBioAuth(
                t("Make sure it's you"),
                t("You're logging out of your account")
            )
            if (isAuthenticated) signOut()
        } catch (err: any) {
            console.error(err)
        }
    }

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <Text style={title}>{t("Are you sure you want to log out?")}</Text>
            <View style={descriptionContainer}>
                <Text style={description}>
                    {t("You will not be able to recover your account if you forget your password.")}
                </Text>
                <Text style={description}>
                    {t("You won't be able to see or interact with Moments of those you follow.")}
                </Text>
            </View>
            <ButtonStandart
                bounciness={5}
                animationScale={0.93}
                borderRadius={8}
                margins={false}
                width={sizes.buttons.width}
                height={40}
                action={handlePress}
                backgroundColor={colors.red.red_05.toString()}
            >
                <Text style={button_text}>{t("Log Out Anyway")}</Text>
            </ButtonStandart>
        </View>
    )
}
