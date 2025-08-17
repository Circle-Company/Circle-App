import { View } from "@/components/Themed"
import NewMomentContext from "@/contexts/newMoment"
import HeaderList from "@/features/new_moment/components/header_list"
import RenderMemory from "@/features/new_moment/components/render_memory"
import sizes from "@/layout/constants/sizes"
import React from "react"
import { FlatList } from "react-native-gesture-handler"

export default function RenderMemoriesSelector() {
    const { getAllMemories, allMemories, setSelectedMemory } = React.useContext(NewMomentContext)

    React.useEffect(() => {
        async function get() {
            await getAllMemories()
        }
        get()
    }, [])

    React.useEffect(() => {
        setSelectedMemory(allMemories[0])
    }, [allMemories])

    const container: any = {
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 4,
    }

    const list_container: any = {
        width: sizes.screens.width,
    }

    return (
        <View style={container}>
            <FlatList
                numColumns={3}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                data={allMemories}
                style={list_container}
                renderItem={({ item }) => {
                    return <RenderMemory memory={item} />
                }}
                ListHeaderComponent={() => {
                    return <HeaderList />
                }}
            />
        </View>
    )
}
