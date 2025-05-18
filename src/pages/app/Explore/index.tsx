import { StatusBar, ViewStyle, useColorScheme } from "react-native"

import React from "react"
import { Search } from "../../../components/search"
import { SearchContextProvider } from "../../../components/search/search-context"
import { View } from "../../../components/Themed"
import ListNearToYou from "../../../features/list-near"
import ListSearch from "../../../features/list-search"
import ColorTheme from "../../../layout/constants/colors"

export default function ExploreScreen() {
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
            <SearchContextProvider>
                <View style={{ zIndex: 1000 }}>
                    <Search.Input />
                </View>
                <ListSearch />
                <View style={{ flex: 1, width: "100%" }}>
                    <ListNearToYou />
                </View>
            </SearchContextProvider>
        </View>
    )
}
