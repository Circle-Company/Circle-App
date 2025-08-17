import React from "react"
import { Dimensions, StatusBar, useColorScheme } from "react-native"
import { WebView } from "react-native-webview"
import { View } from "../../../components/Themed"
import { colors } from "../../../layout/constants/colors"
const WindowWidth = Dimensions.get("window").width

export default function SettingsTermsOfService() {
    const isDarkMode = useColorScheme() === "dark"
    const container = {
        flex: 1,
        width: WindowWidth,
    }

    return (
        <View style={container}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={
                    isDarkMode ? colors.gray.black.toString() : colors.gray.white.toString()
                }
            />
            <WebView
                source={{ uri: "https://circle-company.github.io/Circle-Website/terms-of-service" }}
                style={{ flex: 1 }}
            />
        </View>
    )
}
