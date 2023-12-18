import React, {useEffect} from 'react';
import {StyleSheet, useColorScheme, ActivityIndicator} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import ColorTheme from '../../layout/constants/colors'
import { Text, View } from '../../components/Themed'

export default function Loading(props) {

    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === 'dark'

    const container = {
        borderRadius: 50,
        borderWidth: 1,
        borderColor: ColorTheme().primaryAccent,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center'      
    }

    return(
        <View style={container}>
            <ActivityIndicator
                size={30}
                color={ColorTheme().primary}
            />
        </View>
        
    )        

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        width: 56,
        height: 56,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        fontFamily: 'RedHatDisplay-Bold',
        fontSize: 16,
        color: '#000'
    }
});