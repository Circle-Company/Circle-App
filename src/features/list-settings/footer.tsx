import React from "react"
import { Text, View } from "../../components/Themed"
import LanguageContext from "../../contexts/Preferences/language"
import sizes from "../../layout/constants/sizes"
import fonts from "../../layout/constants/fonts"
import config from "../../config"
import ColorTheme, { colors } from "../../layout/constants/colors"
import { useColorScheme } from "react-native"

export function SettingsFooterComponent() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const container: any = {
        width: sizes.screens.width,
        height: sizes.headers.height * 1.3,
        alignItems: "center",
        justifyContent: "center",
        borderTopWidth: 1,
        borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
    }

    const text: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
    }
    const subText: any = {
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
    }

    return (
        <View style={container}>
            <Text style={text}>{t("Made with love in Brazil")} 💚💛</Text>
            <Text style={subText}>{config.ORGANIZATION_NAME}</Text>
        </View>
    )
}
