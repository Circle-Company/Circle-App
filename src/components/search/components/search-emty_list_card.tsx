import { Text, TextStyle, View, ViewStyle } from "@/components/Themed"
import ColorTheme, { colors } from "@/layout/constants/colors"

import LanguageContext from "@/contexts/Preferences/language"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"
import React from "react"
import { useColorScheme } from "react-native"

export default function EmptyListCard() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"

    const container: ViewStyle = {
        marginTop: sizes.margins["2sm"],
        width: sizes.screens.width - sizes.paddings["2sm"] * 2,
        height: sizes.headers.height,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderRadius: sizes.borderRadius["1md"],
    }
    const title: TextStyle = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        alignSelf: "center",
    }

    return (
        <View style={container}>
            <Text style={title}>{t("We have no results to show you.")}</Text>
        </View>
    )
}
