import React from 'react'
import { View, FlatList, useColorScheme} from 'react-native'
import { Memory } from '../../../../components/memory'
import RenderMemory from '../../components/render-memory'
import sizes from '../../../../layout/constants/sizes'
import ColorTheme, { colors } from '../../../../layout/constants/colors'
import fonts from '../../../../layout/constants/fonts'
import { Text } from '../../../../components/Themed'
import MemoryIcon from '../../../../assets/icons/svgs/memory_outline.svg'

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
        borderBottomWidth: 1,
        borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02,
    }

    const header_container: any = {
        flexDirection: 'row',
        height: sizes.sizes["3md"],
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings["1sm"],
        alignItems: 'center',
        justifyContent: 'center',
    }
    const header_icon: any = {
        marginRight: sizes.margins['2sm']
    }
    const header_text_date: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
    }
    const header_number: any = {
        fontSize: fonts.size.caption1*1.1,
        fontFamily: fonts.family.Bold,
    }
    const content_container: any = {
        flexDirection: 'row',
        width: sizes.screens.width,
        paddingBottom: sizes.paddings['1md'],
        borderBottomWidth: 0.5,
        borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02
    }
    const header_number_container:any = {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: ColorTheme().backgroundDisabled,
        paddingHorizontal: sizes.paddings['1sm'],
        paddingVertical: 2,
        marginLeft: sizes.margins['1sm'],
        borderRadius: 40,
        height: sizes.sizes['1md'],
        minWidth: sizes.sizes['1md']
    }

    return (
        <View style={container}>
            <View style={header_container}>
                <Memory.HeaderLeft>
                    <Text style={header_text_date}>{date_text}</Text>
                </Memory.HeaderLeft>
                    <Memory.HeaderRight>
                        <View style={header_number_container}>
                            <MemoryIcon style={header_icon} width={18} height={18}/>
                            <Text style={header_number}>{count}</Text>
                        </View>
                        
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