import React from "react"
import { View } from "../../components/Themed"
import sizes from "../../layout/constants/sizes"
import NewMomentContext from "../../contexts/newMoment"
import { FlatList } from "react-native-gesture-handler"
import RenderMemory from "./components/render_memory"
import HeaderList from "./components/header_list"

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
