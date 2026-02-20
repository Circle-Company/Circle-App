import { colors } from "@/constants/colors"
import { Text, View } from "@/components/Themed"
import LanguageContext from "@/contexts/language"
import React from "react"
import config from "@/config"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { useColorScheme } from "react-native"

export function SettingsFooterComponent() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const container: any = {
        width: sizes.screens.width,
        height: sizes.headers.height * 1.2,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 100,
        borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
    }

    const text: any = {
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.grey_04,
    }
    const subText: any = {
        marginTop: 3,
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family["Medium-Italic"],
        color: colors.gray.grey_05,
    }

    return (
        <View style={container}>
            <Text style={text}>{t("Circle App for iPhone")}</Text>
            <Text style={subText}>
                {t("by")} {config.ORGANIZATION_NAME}
            </Text>
        </View>
    )
}
