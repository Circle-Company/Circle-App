import { StatusBar, useColorScheme } from "react-native"
import { View, ViewStyle } from "../../../components/Themed"

import React from "react"
import ColorTheme from "../../../constants/colors"
import DeleteMemory from "../../../features/edit-memory/components/delete-memory"
import ListMomentsWithoutInMemory from "../../../features/edit-memory/components/list-moments-without-in-memory"
import TitleMemory from "../../../features/edit-memory/components/title-memory"
import { EditMemoryProvider } from "../../../features/edit-memory/edit_memory_context"

export default function EditMemoryScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const container: ViewStyle = {
        alignItems: "center",
        flex: 1,
    }
    return (
        <View style={container}>
            <EditMemoryProvider>
                <StatusBar
                    translucent={false}
                    backgroundColor={String(ColorTheme().background)}
                    barStyle={isDarkMode ? "light-content" : "dark-content"}
                />
                <TitleMemory />
                <ListMomentsWithoutInMemory />
                <DeleteMemory />
            </EditMemoryProvider>
        </View>
    )
}
