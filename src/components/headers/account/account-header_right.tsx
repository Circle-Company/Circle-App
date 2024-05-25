import React from 'react'
import { View, Text } from 'react-native'
import ColorTheme from '../../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import sizes from '../../../layout/constants/sizes'
import fonts from '../../../layout/constants/fonts'
import HeaderButton from '../headerButton'
import SelectMomentsContext from '../../../contexts/selectMoments'
import Cog from '../../../assets/icons/svgs/cog.svg'
import NewMoment from '../../../assets/icons/svgs/memory.svg'
import LanguageContext from '../../../contexts/Preferences/language'

export default function AccountHeaderRight() {
    const {t} = React.useContext(LanguageContext)
    const {setFrom} = React.useContext(SelectMomentsContext)
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

    function handlePress() {
        setFrom('NEW_MEMORY')
        navigation.navigate('MemoriesNavigator', { screen: 'NewMemorySelectMoments' })
    }

    return(
        <View style={container}>
            <HeaderButton
                action={handlePress}
                width={140}
                marginRight
            >
                <View style={textContainer}>
                    <Text style={text}>{t('New Memory')}</Text>
                </View>
                <NewMoment fill={String(ColorTheme().text)} width={16} height={16}/>
            </HeaderButton>


            <HeaderButton action={() => navigation.navigate('SettingsNavigator')} marginRight>
                <Cog fill={String(ColorTheme().text)} width={22} height={22}/>
            </HeaderButton>
        </View>
    )
}