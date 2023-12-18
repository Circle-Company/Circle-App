import React from 'react';
import { StyleSheet, TouchableOpacity, View, Pressable, Dimensions, Text, useColorScheme, Image, Modal, Animated } from 'react-native';
import ColorTheme from '../../../layout/constants/colors';
import {useNavigation} from '@react-navigation/native';

const WindowWidth = Dimensions.get('window').width
const WindowHeight = Dimensions.get('window').height

export default function HeaderLeftHome() {
    const navigation = useNavigation()
    const MenuIcon = require('../../../assets/icons/pngs/24/upload.png')

    return(
        <View style={styles.container}>
            <TouchableOpacity style={styles.iconContainer} onPress={() => {navigation.navigate('UploadNavigator')}}>
                <Image source={MenuIcon} style={{width: 24, height: 24, tintColor: ColorTheme().text}} resizeMode='contain'/>  
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
        borderRadius: 30,
        top: 0,
        backgroundColor: '#00000000',
        marginLeft: 26,
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
        flexDirection: 'row',
    },
    centeredView: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'flex-end',
        width: WindowWidth,
        height: WindowHeight,
        bottom: - 20
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        width: WindowWidth,
        height: WindowHeight - 200,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 10
        },
        shadowOpacity: 0.50,
        shadowRadius: 4,
        elevation: 5
    },
});