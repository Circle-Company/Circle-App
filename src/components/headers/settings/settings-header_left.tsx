
import React from 'react'
import {View} from 'react-native'
import ColorTheme from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import HeaderButton from '../headerButton'
import ArrowLeft from '../../../assets/icons/svgs/arrow_left.svg'

export default function SettingsHeaderLeft() {

    const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row'
    }

    return(
        <View style={container}>
            <HeaderButton action={() => navigation.goBack()} marginLeft>
                <ArrowLeft fill={String(ColorTheme().text)} width={18} height={18}/>
            </HeaderButton>
        </View>
    )
}