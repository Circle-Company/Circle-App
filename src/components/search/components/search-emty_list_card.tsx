import { Text, View } from "@/components/Themed"
import LanguageContext from "@/contexts/Preferences/language"
import ColorTheme, { colors } from "@/layout/constants/colors"
import fonts from "@/layout/constants/fonts"
import sizes from "@/layout/constants/sizes"
import React from "react"
import { useColorScheme } from "react-native"

export default function EmptyListCard() {
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"

    const container: any = {
        marginTop: sizes.margins["2sm"],
        width: sizes.screens.width,
        height: sizes.headers.height,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        backgroundColor: isDarkMode ? colors.gray.grey_09 : colors.gray.grey_01,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        paddingHorizontal: sizes.paddings["2sm"],
        borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
    }
    const title: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        flex: 1,
    }

    return (
        <View style={container}>
            <Text style={title}>{t("We have no results to show you.")}</Text>
        </View>
    )
}
