import React from 'react'
import { Pressable, View, Text, Animated} from 'react-native'
import ColorTheme from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import HeaderButton from '../headerButton'

import Cog from '../../../assets/icons/svgs/cog.svg'
import Edit from '../../../assets/icons/svgs/edit.svg'

export default function AccountHeaderRight() {
const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row'
    }
    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text
    }

    const textContainer = {
        marginRight: sizes.margins['2sm']
    }

    return(
        <View style={container}>
            <HeaderButton
                action={() => navigation.navigate('SettingsNavigator')}
                width={85}
                marginRight
            >
                <View style={textContainer}>
                    <Text style={text}>Edit</Text>
                </View>
                <Edit fill={String(ColorTheme().text)} width={16} height={16}/>
            </HeaderButton>


            <HeaderButton action={() => navigation.navigate('SettingsNavigator')} marginRight>
                <Cog fill={String(ColorTheme().text)} width={22} height={22}/>
            </HeaderButton>
        </View>
    )
}