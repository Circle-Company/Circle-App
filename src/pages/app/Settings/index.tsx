import { StatusBar, useColorScheme } from "react-native"
import { View, ViewStyle } from "../../../components/Themed"

import React from "react"
import ColorTheme from "../../../constants/colors"
import ListSettings from "../../../features/list-settings"

export default function SettingsScreen() {
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
            <ListSettings />
        </View>
    )
}
