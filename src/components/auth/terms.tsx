import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, Dimensions, Image, useColorScheme} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import { Text, View } from '../Themed'
import ColorScheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes';
import fonts from '../../layout/constants/fonts';
import ColorTheme from '../../layout/constants/colors';

export default function AuthTermsText({signText}: {signText: string}) {
    const navigation = useNavigation()

    const termsText: any = {
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family.Medium,
        color: ColorScheme().textDisabled
    }
    const termsButton: any = {
        top: 3.5,
        fontSize: fonts.size.caption1,
        fontFamily: fonts.family['Medium-Italic'],
        color: ColorTheme().primary
    }
    return(
            <Text style={{ width: Sizes.screens.width - 30*2}}>
                <Text style={termsText}>By using the {`${signText}`}, you confirm that you agree and that you have read and understood our </Text>
                <Text style={{}}>
                    <TouchableOpacity onPress={() => {navigation.navigate('Auth-Privacy-Policy')}}>
                        <Text style={termsButton}>Privacy Policy</Text>            
                    </TouchableOpacity>
                    <Text style={[termsText, {paddingTop: 0}]}>, </Text>
                    <TouchableOpacity onPress={() => {navigation.navigate('Auth-Terms-Of-Service')}}>
                        <Text style={termsButton}>Terms of Service</Text>            
                    </TouchableOpacity>
                    <Text style={[termsText, {paddingTop: 0}]}> and </Text>
                    <TouchableOpacity onPress={() => {navigation.navigate('Auth-Community-Guidelines')}}>
                        <Text style={termsButton}> Community Guidelines</Text>            
                    </TouchableOpacity>
                    <Text style={[termsText, {paddingTop: 0}]}>.</Text>                         
                </Text>
            </Text>
    )        

}