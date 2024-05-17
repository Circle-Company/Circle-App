import React from 'react';
import {    StatusBar, useColorScheme } from 'react-native'
import ColorTheme from '../../../layout/constants/colors'
import Fonts from '../../../layout/constants/fonts'
import { Text, View} from '../../../components/Themed'

export default function LoadingScreen() {
    const isDarkMode = useColorScheme() === 'dark'

    const container:any  = {
        flex: 1,
        backgroundColor: ColorTheme().background,
        alignItems: 'center',
        justifyContent: 'center',
    }
    const title:any  = {
        alignSelf: 'center',
        fontFamily: Fonts.family['Black-Italic'],
        fontSize: 44,
        color: ColorTheme().text,
        marginBottom: 44
    }

    return (
        <View style={container}>
            <StatusBar barStyle={isDarkMode?'lght-content': 'dark-content'}/>
            <Text style={title}>Circle</Text>
        </View>
    )
}