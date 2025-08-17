import React from "react"
import { useColorScheme } from "react-native"
import { Text, View } from "../../../../components/Themed"
import config from "../../../../config"
import ColorTheme, { colors } from "../../../../constants/colors"
import fonts from "../../../../constants/fonts"
import sizes from "../../../../constants/sizes"
import LanguageContext from "../../../../contexts/Preferences/language"

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
