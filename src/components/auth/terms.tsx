import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, Dimensions, Image, useColorScheme} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import { Text, View } from '../Themed'
import ColorScheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes';

export default function AuthTermsText(props) {
    const navigation = useNavigation()
    return(
            <Text style={{ width: Sizes.screens.width - 30*2}}>
                <Text style={[styles.termsText, {color: ColorScheme().textDisabled}]}>By using the {`${props.signText}`}, you confirm that you agree and that you have read and understood our </Text>
                <View style={{flexDirection: 'row',width: 300,}}>
                <TouchableOpacity onPress={() => {navigation.navigate('Policy')}}>
                    <Text style={styles.termsButton}>Privacy Policy</Text>            
                </TouchableOpacity>
                <Text style={[styles.termsText, {paddingTop: 0, color: ColorScheme().textDisabled}]}> and </Text>
                <TouchableOpacity onPress={() => {navigation.navigate('TermsOfService')}}>
                    <Text style={styles.termsButton}>Terms of Service</Text>            
                </TouchableOpacity>
                <Text style={[styles.termsText, {paddingTop: 0}]}>.</Text>          
                </View>
            </Text>
    )        

}

const styles = StyleSheet.create({
    termsText: {
        fontSize: 11,
        fontFamily: 'RedHatDisplay-Regular',
    },
    termsButton: {
        fontSize: 11,
        fontFamily: 'RedHatDisplay-Regular',
    }
});