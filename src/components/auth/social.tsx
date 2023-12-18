import React from 'react';
import {  StyleSheet, Image, Platform, useColorScheme} from 'react-native'
import { Text, View } from '../Themed'
import ColorScheme from '../../layout/constants/colors'

export default function AuthSocialLogin(props:any) {
    const isDarkMode = useColorScheme() === 'dark'

    const iconContainer = {
        borderWidth: 1,
        borderColor: ColorScheme().backgroundDisabled,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        padding: 16
    }
    const icon = {
        width: 24,
        height: 24,
    }

    return(
        <View style={styles.container}>
            <View style={iconContainer}>
                <Image source={require('../../assets/icons/pngs/logos/facebook.png')}style={icon}/>
            </View>
            <View style={iconContainer}>
                <Image source={require('../../assets/icons/pngs/logos/google.png')}style={icon}/>
            </View>    
            {Platform.OS === 'android' ?
                <View style={iconContainer}>
                    <Image
                        source={isDarkMode?
                            require('../../assets/icons/pngs/logos/apple-white.png')
                            : require('../../assets/icons/pngs/logos/apple.png') 
                        }
                        style={icon}
                    />
                </View>    
                : null                
            }
    
        </View>

    )        

}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    }
});