import React from "react"
import { FlatList } from "react-native"
import Tag from "../../../components/moment/components/moment-tag"
import MomentContext from "../../../components/moment/context"
import { View } from "../../../components/Themed"
import sizes from "../../../constants/sizes"

export default function RenderTagsList() {
    const { momentData } = React.useContext(MomentContext)

    React.useEffect(() => {
        async function fetch() {
            if (momentData.getTags) {
                await momentData.getTags()
            }
        }
        fetch()
    }, [momentData])

    const container: any = {
        left: -sizes.paddings["1md"],
        flexDirection: "row",
        paddingTop: sizes.paddings["1sm"] * 0.5,
        width: sizes.screens.width,
    }

    if (!momentData.tags) return null

    return (
        <View style={container}>
            <FlatList
                horizontal={true}
                data={momentData.tags}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: sizes.paddings["2sm"] }}
                renderItem={({ item }) => {
                    return <Tag title={item.title} color="#000000" />
                }}
            />
        </View>
    )
}
