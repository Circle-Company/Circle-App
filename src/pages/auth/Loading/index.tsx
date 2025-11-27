import { StatusBar, useColorScheme } from "react-native"
import { Text, View } from "../../../components/Themed"

import ColorTheme from "../../../constants/colors"
import Fonts from "../../../constants/fonts"
import React from "react"

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
            <StatusBar
                barStyle={"light-content"}
                backgroundColor="transparent"
                translucent={true}
            />
            <Text style={title}>Circle</Text>
        </View>
    )
}
