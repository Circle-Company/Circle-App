import { View, ViewStyle } from "@/components/Themed"
import { StatusBar, useColorScheme } from "react-native"

import ListSettings from "@/features/list-settings"
import ColorTheme from "@/layout/constants/colors"
import React from "react"

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
