import ColorTheme, { colors } from "../../constants/colors"
import { Text, View } from "../../components/Themed"

import LanguageContext from "../../contexts/Preferences/language"
import React from "react"
import config from "../../config"
import fonts from "../../constants/fonts"
import sizes from "../../constants/sizes"
import { useColorScheme } from "react-native"

export function SettingsFooterComponent() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const container: any = {
        width: sizes.screens.width,
        height: sizes.headers.height,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: sizes.margins["2md"],
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
