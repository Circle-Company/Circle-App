import React, {useRef} from 'react';
import { StyleSheet, TouchableOpacity, View, Pressable, Dimensions, Text, useColorScheme, Image } from 'react-native';
import Colors from '../../../constants/Colors';
import {useNavigation} from '@react-navigation/native';

const WindowWidth = Dimensions.get('window').width
const WindowHeight = Dimensions.get('window').height

export default function HeaderRightProfile() {

    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === 'dark';

    const HistoryIcon = require('../../../assets/icons/pngs/24/history.png')
    const ConfigIcon = require('../../../assets/icons/pngs/24/settings.png')
    const SearchIcon = require('../../../assets/icons/pngs/24/search.png')

    return(
        <View style={styles.container}>
            
            <TouchableOpacity style={styles.iconContainer} onPress={() => {navigation.navigate('HistoryNavigator')}}>
                <Image source={HistoryIcon} style={{width: 24, height: 24, tintColor: isDarkMode ? Colors.dark.text: Colors.light.text}} resizeMode='contain'/>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconContainer} onPress={() => {navigation.navigate('SettingsNavigator')}}>
                <Image source={ConfigIcon} style={{width: 24, height: 24, tintColor: isDarkMode ? Colors.dark.text: Colors.light.text}} resizeMode='contain'/>
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
        marginRight: 10,
        borderRadius: 30,
        top: 0,
        backgroundColor: '#00000000',
        width: 40,
        height: 40,
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