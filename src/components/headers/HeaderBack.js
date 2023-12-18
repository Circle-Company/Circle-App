import React, {useRef} from 'react';
import { StyleSheet, TouchableOpacity, View, Pressable, Dimensions, Text, useColorScheme, Image } from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Colors from '../../constants/Colors';

const WindowWidth = Dimensions.get('window').width
const WindowHeight = Dimensions.get('window').height

export default function HeaderHome({close}) {

    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === 'dark';

    const ArrowLeftIcon = require('../../assets/icons/pngs/24/arrow-left.png')
    const XIcon = require('../../assets/icons/pngs/24/x.png')

    return(
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.goBack() }>
                <Image source={close? XIcon:ArrowLeftIcon} style={{width: 24, height: 24, tintColor: isDarkMode ? Colors.dark.text: Colors.light.text}} resizeMode='contain'/>
            </TouchableOpacity>   

                 
                
        </View>        
    )

}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginLeft: 10,
        borderRadius: 30,
        padding: 8,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconContainer2: {
        marginRight: 22,
        borderRadius: 30,
        top: 0,
        backgroundColor: '#00000040',
        width: 40,
        height: 40,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
});