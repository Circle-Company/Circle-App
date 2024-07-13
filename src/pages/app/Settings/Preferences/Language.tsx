import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { View } from "../../../../components/Themed"
import ListLanguagesSelector from "../../../../features/list-languages-selector"
import ColorTheme from "../../../../layout/constants/colors"
export default function LanguageScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const container = {
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
