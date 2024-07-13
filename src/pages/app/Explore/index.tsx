import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { Search } from "../../../components/search"
import { SearchContextProvider } from "../../../components/search/search-context"
import { View } from "../../../components/Themed"
import ListSearch from "../../../features/list-search"
import ColorTheme from "../../../layout/constants/colors"
export default function ExploreScreen() {
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
            <SearchContextProvider>
                <Search.Input />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ListSearch />
                </ScrollView>
            </SearchContextProvider>
        </View>
    )
}
