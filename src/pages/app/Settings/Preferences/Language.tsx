import { StatusBar, useColorScheme } from "react-native"
import { View, ViewStyle } from "../../../../components/Themed"

import React from "react"
import ColorTheme from "../../../../constants/colors"
import ListLanguagesSelector from "../../../../features/list-languages-selector"

export default function LanguageScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const container: ViewStyle = {
        alignItems: "center",
        flex: 1,
    }

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <ListLanguagesSelector />
        </View>
    )
}
