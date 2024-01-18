
import React from 'react'
import {View} from 'react-native'
import ColorTheme, { colors } from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import HeaderButton from '../headerButton'
import ArrowLeft from '../../../assets/icons/svgs/close.svg'

export default function MemoriesListMomentsHeaderLeft() {

    const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row'
    }

    return(
        <View style={container}>
            <HeaderButton
                action={() => navigation.goBack()}
                marginLeft
                color={String(colors.gray.grey_07)}
            >
                <ArrowLeft fill={String(colors.gray.white)} width={16} height={16}/>
            </HeaderButton>
        </View>
    )
}