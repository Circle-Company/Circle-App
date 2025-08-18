import ColorTheme, { colors } from "../../../constants/colors"
import { Text, TextStyle, View, ViewStyle } from "../../Themed"

import React from "react"
import { useColorScheme } from "react-native"
import fonts from "../../../constants/fonts"
import sizes from "../../../constants/sizes"
import LanguageContext from "../../../contexts/Preferences/language"

export default function NotTyping() {
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
        flex: 1,
    }

    return (
        <View style={container}>
            <Text style={title}>{t("Search for some @username to show results.")}</Text>
        </View>
    )
}
