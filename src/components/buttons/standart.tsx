import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, Dimensions, useColorScheme} from 'react-native'
import {useNavigation} from '@react-navigation/native'

import ColorScheme, { colors } from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import Fonts from '../../layout/constants/fonts'

import { Text, View } from '../Themed'

type buttonStandart = {
  navigateTo: any,
  title: any
}

export default function ButtonStandart({navigateTo, title}:buttonStandart) {

    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === 'dark'

    //width : 155
    const container = {
        height: Sizes.screens.width /8,
        alignItems: 'center',
        justifyContent: 'center',
        margin: Sizes.margins['2sm'],
    }

    const text = {
        color: colors.gray.white,
        fontFamily: Fonts.family['BoldI-talic'],
        fontSize: 14,
    }

    return(
        <TouchableOpacity
          style={container}
          onPress={() => { navigation.navigate(navigateTo)}}
        >
          <Text style={text}>{title.toUpperCase()}</Text>
        </TouchableOpacity>
    )        

}