import React from 'react'
import { View, FlatList} from 'react-native'
import memory_data from '../../../data/memories.json'
import { Memory } from '../../../components/memory'
import RenderMemory from '../components/render-memory'
import RenderMemoryFooter from '../components/render-memory_footer'
import ViewMorebutton from '../../../components/buttons/view_more'
import { useNavigation } from '@react-navigation/native'

type RenderMemoriesPreviewProps = {
    enableScroll?: boolean
}
export default function ListMemoriesPreview ({}: RenderMemoriesPreviewProps) {

    const navigation = useNavigation()
    const memories = memory_data
    
    const container = {}
    const content_container: any = {
        flexDirection: 'row',
    }
    
    return (
        <View style={container}>
            <Memory.Header>
                <Memory.HeaderLeft text='Memories' number={memories.memories_count}/>
                <Memory.HeaderRight>
                    <ViewMorebutton action={() => navigation.navigate('MemoriesNavigator')} text='View All'/>
                </Memory.HeaderRight>
            </Memory.Header>
            <FlatList
                style={content_container}
                data={memories.content}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => {
                    return ( <RenderMemory memory={item} index={index} numOfMemories={memories.content.length}/>)
                }}
                ListHeaderComponent={() => { return <View style={{width: 15}}></View>}}
                ListFooterComponent={() => { return (<RenderMemoryFooter/>)}}
            />
        </View>
    )
}