import React from "react"
import { View, Text, useColorScheme } from "react-native"
import fonts from "../../../layout/constants/fonts"
import ColorTheme, { colors } from "../../../layout/constants/colors"
import { TagProps } from "../moment-types"
import sizes from "../../../layout/constants/sizes"

export default function tag({
    title,
    color = String(ColorTheme().text),
    backgroundColor = String(ColorTheme().backgroundDisabled),
}: TagProps) {
    const isDarkMode = useColorScheme() === "dark"

    const tag_container: any = {
        height: sizes.sizes["1md"] * 0.9,
        backgroundColor: `${colors.blue.blue_05}${isDarkMode ? 25 : 10}`,
        paddingHorizontal: sizes.paddings["1sm"],
        alignItems: "center",
        justifyContent: "center",
        marginLeft: sizes.margins["1sm"],
        borderRadius: (sizes.sizes["1md"] * 0.9) / 2,
    }

    const text_style: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family["Medium-Italic"],
        color: isDarkMode ? colors.blue.blue_02 : colors.blue.blue_05,
    }

    return (
        <View style={tag_container}>
            <Text style={text_style}>#{title}</Text>
        </View>
    )
}
