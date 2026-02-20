import { useNavigation } from "@react-navigation/native"
import React from "react"
import { TextStyle, ViewStyle } from "react-native"
import { Text, View } from "@/components/Themed"
import PasswordInput from "@/components/auth/passwordInput"
import ButtonStandart from "@/components/buttons/button-standart"
import ColorTheme, { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import AuthContext from "@/contexts/auth"
import PersistedContext from "@/contexts/Persisted"
import LanguageContext from "@/contexts/language"
import api from "@/api"

export default function PasswordScreen() {
    const { t } = React.useContext(LanguageContext)
    const { signInputPassword, setSignInputPassword } = React.useContext(AuthContext)
    const { session } = React.useContext(PersistedContext)
    const navigation = useNavigation()

    const container: ViewStyle = {
        alignItems: "center",
        paddingTop: sizes.margins["1md"],
    }

    const input_container: ViewStyle = {
        alignItems: "center",
        paddingBottom: sizes.paddings["1xl"] * 0.8,
    }

    const description: any = {
        fontSize: fonts.size.title2,
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
        textAlign: "center",
        paddingHorizontal: sizes.paddings["1md"],
        marginBottom: sizes.margins["1xl"] * 1.3,
    }
    const button_text: TextStyle = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family["Black-Italic"],
        color: signInputPassword.length >= 4 ? colors.gray.black : colors.gray.grey_04 + "90",
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
                    { headers: { Authorization: session.account.jwtToken } },
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
            <Text style={description}>{`Chose a new password`}</Text>
            <Text style={subDescription}>
                {t(
                    "For your account security, your password cannot be recovered if you forgot it.",
                )}
            </Text>
            <View style={input_container}>
                <PasswordInput type="signUp" />
            </View>

            <ButtonStandart
                margins={false}
                height={40}
                action={handlePress}
                style={{ minWidth: sizes.buttons.width * 0.3 }}
                backgroundColor={
                    signInputPassword.length >= 4
                        ? colors.gray.white
                        : ColorTheme().backgroundDisabled.toString()
                }
            >
                <Text style={button_text}>{t("Update")}</Text>
            </ButtonStandart>
        </View>
    )
}
