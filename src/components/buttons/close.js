import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, Dimensions, Text, Image} from 'react-native'
import {useNavigation} from '@react-navigation/native'

export default function ButtonClose(props) {
    const navigation = useNavigation()
    const container = {
        backgroundColor: props.transparent == true? '#12121D30' : props.style.backgroundColor,
        width: 44,
        height: 44,
        borderRadius: 50,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'     
    }
    const icon = {
        width: 24,
        height: 24,
        tintColor: props.transparent == true? '#FFF' : props.style.iconColor
    }

    return(
        <TouchableOpacity style={container} onPress={() => {navigation.goBack()}}resizeMode={'contain'}>
            <Image source={require('../../assets/icons/pngs/24/x.png')}style={icon}/>
        </TouchableOpacity>
    )        

}