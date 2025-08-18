import { useNavigation } from "@react-navigation/native"
import React from "react"
import { TouchableOpacity, useColorScheme } from "react-native"
import ColorTheme from "../../constants/colors"
import Fonts from "../../constants/fonts"
import Sizes from "../../constants/sizes"
import { Text } from "../Themed"

type buttonStandart = {
    navigateTo: any
    title: any
}

export default function ButtonStandart({ navigateTo, title }: buttonStandart) {
    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === "dark"

    //width : 155
    const container = {
        height: Sizes.screens.width / 8,
        alignItems: "center",
        justifyContent: "center",
        margin: Sizes.margins["2sm"],
    }

    const text = {
        color: ColorTheme().text,
        fontFamily: Fonts.family["Semibold-Italic"],
        fontSize: 14,
    }

    return (
        <TouchableOpacity
            style={container}
            onPress={() => {
                navigation.navigate(navigateTo)
            }}
        >
            <Text style={text}>{title}</Text>
        </TouchableOpacity>
    )
}
