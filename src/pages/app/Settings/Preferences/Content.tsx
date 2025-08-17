import React from "react"
import { Pressable, StatusBar, useColorScheme } from "react-native"
import { Text, View } from "../../../../components/Themed"
import ColorTheme from "../../../../layout/constants/colors"

export default function ContentScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        alignItems: "center",
        flex: 1,
    }

    function handlePress() {}

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <Text>Settings-Content_screen</Text>
            <Pressable onPress={handlePress}>
                <Text>ChangeContent</Text>
            </Pressable>
        </View>
    )
}
