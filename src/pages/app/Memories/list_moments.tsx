import React from "react"
import { StatusBar } from "react-native"
import { View } from "../../../components/Themed"
import ListMemoryMoments from "../../../features/list-memories/list-memory-moments"
import { colors } from "../../../layout/constants/colors"

export default function MemoriesListMomentsScreen() {
    const container = {
        alignItems: "center",
        flex: 1,
        backgroundColor: colors.gray.black,
    }

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(colors.gray.black)} barStyle={"light-content"} />
            <ListMemoryMoments />
        </View>
    )
}
