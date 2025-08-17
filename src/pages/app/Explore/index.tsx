import { StatusBar, ViewStyle, useColorScheme } from "react-native"

import ColorTheme from "../../../layout/constants/colors"
import ListNearToYou from "../../../features/list-near"
import ListSearch from "../../../features/list-search"
import React from "react"
import { Search } from "../../../components/search"
import { SearchContextProvider } from "../../../components/search/search-context"
import { View } from "../../../components/Themed"
import sizes from "@/layout/constants/sizes"

export default function ExploreScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const container: ViewStyle = {
        alignItems: "center",
        flex: 1,
    }

    const inputStyle: ViewStyle = {
        marginTop: sizes.margins["2sm"],
        zIndex: 1000,
    }

    const nearToYouStyle: ViewStyle = {
        flex: 1,
        width: "100%",
    }

    return (
        <View style={container}>
            <StatusBar
                backgroundColor={String(ColorTheme().background)}
                barStyle={isDarkMode ? "light-content" : "dark-content"}
            />
            <SearchContextProvider>
                <View style={inputStyle}>
                    <Search.Input />
                </View>
                <ListSearch />
                <View style={nearToYouStyle}>
                    <ListNearToYou />
                </View>
            </SearchContextProvider>
        </View>
    )
}
