import React from 'react';
import { View, Text } from 'react-native';
import ColorTheme from '../../../layout/constants/colors';
import {useNavigation} from '@react-navigation/native';
import Camera from '../../../assets/icons/svgs/moment.svg'
import InboxIcon from '../../../assets/icons/svgs/tray.svg'
import sizes from '../../../layout/constants/sizes';
import fonts from '../../../layout/constants/fonts';
import ButtonStandart from '../../buttons/button-standart';
import NotificationContext from '../../../contexts/notification';
import { BadgeIcon } from '../../general/badge-icon';
import LanguageContext from '../../../contexts/Preferences/language';

export default function HeaderRightHome() {
    const {t} = React.useContext(LanguageContext)

    const {newNotificationsNum} = React.useContext(NotificationContext)
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

    async function onPressNewMoment() {
        navigation.navigate('MomentNavigator', {screen: 'NewMomentImageScreen'})
    }

    async function onPressInbox() {
        navigation.navigate('InboxNavigator', {screen: 'Inbox'})
    }

    const active = newNotificationsNum> 0? true: false
    return(
        <View style={container}>
        <ButtonStandart action={onPressNewMoment} width={140} backgroundColor={String(ColorTheme().backgroundDisabled)}>
            <View style={textContainer}>
                <Text style={text}>{t('New Moment')}</Text>
            </View>
            <Camera fill={String(ColorTheme().text)} width={16} height={16}/>
        </ButtonStandart>  

        <ButtonStandart action={onPressInbox} backgroundColor={String(ColorTheme().backgroundDisabled)}>
            <BadgeIcon active={active} number={newNotificationsNum}/>
            <InboxIcon fill={String(ColorTheme().text)} width={18} height={18}/>
        </ButtonStandart>                  
        </View>


    )
}