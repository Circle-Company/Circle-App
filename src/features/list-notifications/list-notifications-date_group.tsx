import React from 'react'
import { View, FlatList, useColorScheme} from 'react-native'
import { Memory } from '../../components/memory'
import RenderMemory from '../list-memories/components/render-memory'
import sizes from '../../layout/constants/sizes'
import ColorTheme, { colors } from '../../layout/constants/colors'
import fonts from '../../layout/constants/fonts'
import { Text } from '../../components/Themed'
import NotificationIcon from '../../assets/icons/svgs/bell.svg'
import RenderDate from '../../components/general/render-date'
import RenderNotification from './components/render-notification'
import RenderNotificationsCount from '../list-memories/components/render-memories_count'
type RenderNotificationsAllProps = {
    data: any,
    date_text: string,
    count: number, 
    enableScroll?: boolean
}
export function ListNotificationsAll ({
    data,
    date_text,
    count
}: RenderNotificationsAllProps) {

    const isDarkMode = useColorScheme() === 'dark'
    const notifications = data
    
    const container: any = {
        width: sizes.screens.width,
    }
    const header_container: any = {
        flexDirection: 'row',
        height: sizes.sizes["2md"],
        width: sizes.screens.width,
        paddingHorizontal: sizes.paddings["1sm"],
        alignItems: 'center',
        justifyContent: 'center',
    }
    const content_container: any = {
        width: sizes.screens.width,
        paddingBottom: sizes.paddings['1lg'],
        borderBottomWidth: 1,
        borderColor: isDarkMode? colors.gray.grey_08: colors.gray.grey_02
    }
    return (
        <View style={container}>
            <View style={header_container}>
                <Memory.HeaderLeft>
                    <RenderDate date={date_text} scale={1.1}/>
                </Memory.HeaderLeft>
                    
            </View>
            <FlatList
                scrollEnabled={false}
                style={content_container}
                data={notifications.content}
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => {
                    return ( <RenderNotification key={item.id} notification={item}/> )
                }}
                ListHeaderComponent={() => { return <View style={{width: 15}}></View>}}
                ListFooterComponent={() => { return <View style={{width: 15}}></View>}}
            />
        </View>
    )
}