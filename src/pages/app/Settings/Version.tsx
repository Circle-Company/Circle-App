import React, {useRef} from 'react';
import { StatusBar,  useColorScheme, Linking, Pressable} from 'react-native'
import { Text, View } from '../../../components/Themed'
import ColorTheme from '../../../layout/constants/colors'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts';

export default function VersionScreen() {
    const isDarkMode = useColorScheme() === 'dark'

    const container  = {
      alignItems:'center',
      flex: 1
    }

    const description_container: any = {
        paddingHorizontal: sizes.paddings['1md'],
        paddingVertical: sizes.paddings['2sm'],
    }

    const description_style: any = {
        lineHeight: 12,
        marginBottom: sizes.margins['2sm'],
        fontSize: fonts.size.body * 0.9,
        fontFamily: fonts.family.Medium,
        color: ColorTheme().textDisabled,
        textAlign: 'justify'
    }

    const item_container: any = {
        paddingHorizontal: sizes.paddings['2md'],
        marginBottom: sizes.margins['2sm'],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }

    const text: any = {
        fontFamily: fonts.family.Regular,
        color: ColorTheme().text
    }

    const title = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Semibold,
        color: ColorTheme().text
    }

    const data = [
        {title: 'CIrcle App (Test Version)', version: 'v1.0.0-beta'},
    ]

    return (
        <View style={container}>
            <StatusBar backgroundColor={String(ColorTheme().background)} barStyle={isDarkMode? 'light-content': 'dark-content'}/>
            <View style={description_container}>
                        <Text style={description_style}>* Keeping the API version up to date and carefully managing changes and updates is critical to ensuring the stability, security, and continued functionality of the application over time.</Text>
            </View>

            <View style={description_container}>
                        <Text style={[description_style, {top: -10}]}>*Beta test verison, performance and features currently present do not represent the final release version </Text>
            </View>
            {data.map((item, index) => {
                return (
                    <View key={index} style={item_container}>
                        <Text style={[title, {flex: 1}]}>{item.title}</Text>
                        <Text style={text}>{item.version}</Text>
                    </View>                    
                )
            })}
        </View>
    )
}