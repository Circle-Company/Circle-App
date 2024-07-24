import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { View } from "../../../components/Themed"
import ListMemoriesAll from "../../../features/list-memories/list-memories-all"
import ColorTheme from "../../../layout/constants/colors"

export default function MemoriesScreen() {
    const isDarkMode = useColorScheme() === "dark"
    const {}

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
            <ListMemoriesAll user={} />
        </View>
    )
}
