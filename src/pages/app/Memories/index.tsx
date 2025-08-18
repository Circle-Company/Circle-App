import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { View } from "../../../components/Themed"
import ColorTheme from "../../../constants/colors"
import ListMemoriesAll from "../../../features/list-memories/list-memories-all"

export default function MemoriesScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        alignItems: "center",
        flex: 1,
    }
    return (
        <View style={container}>
            <StatusBar
                translucent={false}
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <ListMemoriesAll />
        </View>
    )
}
