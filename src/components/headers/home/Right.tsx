import React from 'react';
import { Pressable, View, Text, Animated} from 'react-native';
import ColorTheme from '../../../layout/constants/colors';
import {useNavigation} from '@react-navigation/native';
import Camera from '../../../assets/icons/svgs/camera.svg'
import InboxIcon from '../../../assets/icons/svgs/tray.svg'
import sizes from '../../../layout/constants/sizes';
import fonts from '../../../layout/constants/fonts';
import ButtonStandart from '../../buttons/button-standart';

export default function HeaderRightHome() {
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
    const badge_style = {
        zIndex: 10,
        position: 'absolute',
        top: 0,
        right: -4,
        width: 17,
        height: 17,
        borderRadius: 10,
        backgroundColor: ColorTheme().error,
        borderWidth: 3,
        borderColor: ColorTheme().background
    }

    async function onPressNewMoment() {
        console.log('New Moment Pressed')
    }

    async function onPressInbox() {
        navigation.navigate('InboxNavigator', {screen: 'Inbox'})
        console.log('New Moment Pressed')
    }
    return(
        <View style={container}>
        <ButtonStandart action={onPressNewMoment} width={sizes.buttons.width*0.45} backgroundColor={String(ColorTheme().backgroundDisabled)}>
            <View style={textContainer}>
                <Text style={text}>New Moment</Text>
            </View>
            <Camera fill={String(ColorTheme().text)} width={16} height={16}/>
        </ButtonStandart>  
        <ButtonStandart action={onPressInbox} backgroundColor={String(ColorTheme().backgroundDisabled)}>
            <View style={badge_style}/>
            <InboxIcon fill={String(ColorTheme().text)} width={18} height={18}/>
        </ButtonStandart>                  
        </View>


    )
}