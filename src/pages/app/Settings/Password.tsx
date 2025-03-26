import { useNavigation } from "@react-navigation/native"
import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import Icon from "../../../assets/icons/svgs/check_circle.svg"
import { Text, View } from "../../../components/Themed"
import PasswordInput from "../../../components/auth/password_input"
import ButtonStandart from "../../../components/buttons/button-standart"
import AuthContext from "../../../contexts/Auth"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import fonts from "../../../layout/constants/fonts"
import sizes from "../../../layout/constants/sizes"
import api from "../../../services/Api"

export default function PasswordScreen() {
    const { t } = React.useContext(LanguageContext)
    const { signInputPassword, setSignInputPassword } = React.useContext(AuthContext)
    const { session } = React.useContext(PersistedContext)
    const isDarkMode = useColorScheme() === "dark"
    const navigation = useNavigation()

    const container = {
        alignItems: "center",
        flex: 1,
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

    async function handlePress() {
        if (signInputPassword) {
            try {
                await api.put(
                    "/auth/change-password",
                    {
                        user_id: session.user.id,
                        password_input: signInputPassword,
                    },
                    { headers: { Authorization: session.account.jwtToken } }
                )
                setSignInputPassword("")
                navigation.goBack()
            } catch (err: any) {
                console.log(err.message)
            }
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
                <PasswordInput sign={false} />
            </View>

            <ButtonStandart
                margins={false}
                width={sizes.buttons.width / 3.5}
                height={40}
                action={handlePress}
                backgroundColor={
                    signInputPassword
                        ? ColorTheme().primary.toString()
                        : ColorTheme().backgroundDisabled.toString()
                }
            >
                <Text style={button_text}>{t("Done")}</Text>
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
        </View>
    )
}
