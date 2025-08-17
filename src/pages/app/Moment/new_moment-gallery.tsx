import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { Text, View } from "../../../components/Themed"
import ColorTheme from "../../../layout/constants/colors"

export default function NewMomentGalleryScreen() {
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
            <Text> new_moment_gallery_screen</Text>
        </View>
    )
}
