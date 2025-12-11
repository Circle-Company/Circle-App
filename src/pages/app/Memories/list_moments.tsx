import React from "react"
import StatusBar from "../../../components/StatusBar"
import { View } from "../../../components/Themed"
import { colors } from "../../../constants/colors"
import ListMemoryMoments from "../../../features/list-memories/list-memory-moments"

export default function MemoriesListMomentsScreen() {
    const container = {
        alignItems: "center",
        flex: 1,
        backgroundColor: colors.gray.black,
    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(colors.gray.black)} barStyle="light-content" />
            <ListMemoryMoments />
        </View>
    )
}
