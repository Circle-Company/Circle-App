import React from "react"
import { StatusBar, useColorScheme } from "react-native"
import { View } from "../../../components/Themed"
import DeleteMemory from "../../../features/edit-memory/components/delete-memory"
import ListMomentsWithoutInMemory from "../../../features/edit-memory/components/list-moments-without-in-memory"
import TitleMemory from "../../../features/edit-memory/components/title-memory"
import { EditMemoryProvider } from "../../../features/edit-memory/edit_memory_context"
import ColorTheme from "../../../layout/constants/colors"

export default function EditMemoryScreen() {
    const isDarkMode = useColorScheme() === "dark"

    const container = {
        alignItems: "center",
        flex: 1,
    }

    const top = {}
    const center = {
        flex: 1,
    }
    const footer = {
        alignItems: "center",
        jusitfyContent: "flex-end",
    }
    return (
        <View style={container}>
            <EditMemoryProvider>
                <StatusBar
                    translucent={false}
                    backgroundColor={String(ColorTheme().background)}
                    barStyle={isDarkMode ? "light-content" : "dark-content"}
                />
                <View style={top}>
                    <TitleMemory />
                </View>
                <View style={center}>
                    <ListMomentsWithoutInMemory />
                </View>

                <View style={footer}>
                    <DeleteMemory />
                </View>
            </EditMemoryProvider>
        </View>
    )
}
