import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { Text, View } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import Fonts from "../../../constants/fonts"

export default function LoadingScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        flex: 1,
        backgroundColor: ColorTheme().background,
        alignItems: "center",
        justifyContent: "center",
    }
    const title = {
        alignSelf: "center",
        fontFamily: Fonts.family["Black-Italic"],
        fontSize: 44,
        color: ColorTheme().text,
        marginBottom: 44,
    }

    return (
        <View style={container}>
            <StatusBar barStyle={isDarkMode ? "lght-content" : "dark-content"} />
            <Text style={title}>Circle</Text>
        </View>
    )
}
