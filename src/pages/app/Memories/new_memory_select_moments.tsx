import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { View } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import ListSelectMoments from "../../../features/select-moments"

export default function NewMemorySelectMomentsScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        flex: 1,
    }
    return (
        <View style={container}>
            <StatusBar
                translucent={false}
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <ListSelectMoments />
        </View>
    )
}
