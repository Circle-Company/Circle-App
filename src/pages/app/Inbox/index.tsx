import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { View } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import ListNotifcations from "../../../features/list-notifications"

export default function InboxScreen() {
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
            <ListNotifcations />
        </View>
    )
}
