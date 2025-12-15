import { useNavigation } from "@react-navigation/native"
import React from "react"
import { useTranslation } from "react-i18next"
import { TextStyle, TouchableOpacity, useColorScheme, ViewProps } from "react-native"
import { colors, default as ColorScheme, default as ColorTheme } from "../../constants/colors"
import fonts from "../../constants/fonts"
import sizes from "../../constants/sizes"
import { Text } from "../Themed"

type Props = ViewProps & {
    signText: string
}

export default function AuthTermsText({ signText }: Props) {
    const navigation: any = useNavigation()
    const { t } = useTranslation()
    const isDarkMode = useColorScheme() === "dark"

    const container: TextStyle = {
        width: sizes.screens.width - 20 * 2,
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderRadius: sizes.borderRadius["1md"],
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    }

    const termsText: TextStyle = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_03,
        textAlign: "center",
    }
    const termsButton: any = {
        top: 4,
        fontSize: fonts.size.body * 0.85,
        fontFamily: fonts.family["Medium-Italic"],
        color: ColorTheme().primaryAccent,
        textDecorationLine: "underline",
    }
    return (
        <Text style={container}>
            <Text style={termsText}>
                {t("By using the")} {`"${signText}"`},{" "}
                {t("you confirm that you agree and that you have read and understood our")}{" "}
            </Text>
            <Text style={{ textAlign: "center" }}>
                <TouchableOpacity
                    testID="handle-privacy-policy"
                    onPress={() => {
                        navigation.navigate("Auth-Privacy-Policy")
                    }}
                >
                    <Text style={termsButton}>{t("Privacy Policy")}</Text>
                </TouchableOpacity>
                <Text style={[termsText, { paddingTop: 0 }]}>, </Text>
                <TouchableOpacity
                    testID="handle-terms-of-service"
                    onPress={() => {
                        navigation.navigate("Auth-Terms-Of-Service")
                    }}
                >
                    <Text style={termsButton}>{t("Terms of Service")}</Text>
                </TouchableOpacity>
                <Text style={[termsText, { paddingTop: 0 }]}> {t("and")} </Text>
                <TouchableOpacity
                    testID="handle-community-guidelines"
                    onPress={() => {
                        navigation.navigate("Auth-Community-Guidelines")
                    }}
                >
                    <Text style={termsButton}>{t("Community Guidelines")}</Text>
                </TouchableOpacity>
                <Text style={[termsText, { paddingTop: 0 }]}>.</Text>
            </Text>
        </Text>
    )
}
