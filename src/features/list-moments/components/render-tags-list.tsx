import React from "react"
import { View } from "../../../components/Themed"
import { FlatList } from "react-native"
import sizes from "../../../layout/constants/sizes"
import MomentContext from "../../../components/moment/context"
import Tag from "../../../components/moment/components/moment-tag"

export default function RenderTagsList() {
    const { momentData, momentFunctions} = React.useContext(MomentContext)

    React.useEffect(() => {
        async function fetch() {
            await momentData.findTags()
        }; fetch()

    }, [])

    const container: any = {
        left: -sizes.paddings['1md'],
        flexDirection: 'row',
        paddingTop: sizes.paddings["1sm"] * 0.5,
        width: sizes.screens.width
    }

    if(!momentData.tags) return null

    return (
        <View style={container}>
            <FlatList
                horizontal={true}
                data={momentData.tags}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: sizes.paddings["2sm"] }}
                renderItem={({item, index}) => {
                    return ( <Tag title={item.title} color="#000000"/> )
                }}
            />
        </View>
    )
}