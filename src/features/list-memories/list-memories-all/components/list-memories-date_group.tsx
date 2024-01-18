import React from 'react'
import { View, FlatList, useColorScheme} from 'react-native'
import { Memory } from '../../../../components/memory'
import RenderMemory from '../../components/render-memory'
import sizes from '../../../../layout/constants/sizes'
import ColorTheme, { colors } from '../../../../layout/constants/colors'
import fonts from '../../../../layout/constants/fonts'
import { Text } from '../../../../components/Themed'
import MemoryIcon from '../../../../assets/icons/svgs/memory_outline.svg'
import RenderDate from '../../../../components/general/render-date'
import RenderMemoriesCount from '../../components/render-memories_count'
type RenderMemoriesAllProps = {
    data: any,
    date_text: string,
    count: number, 
    enableScroll?: boolean
}
export function ListMemoriesAll ({
    data,
    date_text,
    count
}: RenderMemoriesAllProps) {

    const isDarkMode = useColorScheme() === 'dark'
    const memories = data
    
    const container: any = {
        width: sizes.screens.width,
    }
    const header_container: any = {
        flexDirection: 'row',
        height: sizes.sizes["3md"],
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings["1sm"],
        alignItems: 'center',
        justifyContent: 'center',
    }
    const content_container: any = {
        flexDirection: 'row',
        width: sizes.screens.width,
        paddingBottom: sizes.paddings['1md'],
        borderBottomWidth: 0.5,
        borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02
    }

    return (
        <View style={container}>
            <View style={header_container}>
                <Memory.HeaderLeft>
                    <RenderDate date={date_text}/>
                </Memory.HeaderLeft>
                <Memory.HeaderRight>
                    <RenderMemoriesCount count={count}/>
                </Memory.HeaderRight>                    
            </View>
            <FlatList
                style={content_container}
                data={memories.content}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item, index}) => {
                    return ( <RenderMemory memory={item} index={index} numOfMemories={memories.content.length}/>)
                }}
                ListHeaderComponent={() => { return <View style={{width: 15}}></View>}}
                ListFooterComponent={() => { return <View style={{width: 15}}></View>}}
            />
        </View>
    )
}