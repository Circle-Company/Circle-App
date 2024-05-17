import React from 'react'
import { View } from 'react-native'
import ColorTheme from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import HeaderButton from '../headerButton'
import More from '../../../assets/icons/svgs/arrow_left.svg'

export default function MomentFullHeaderLeft() {
    const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row',
        alignItems: 'center'
    }

    return(
        <View style={container}>
            <HeaderButton action={() => navigation.goBack()} marginLeft>
                <More fill={String(ColorTheme().text)} width={18} height={18}/>
            </HeaderButton>                
        </View>
    )
}