import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, useColorScheme,TouchableOpacity, Image, Dimensions, View} from 'react-native'
import ColorTheme from '../../../layout/constants/colors'
import Sizes from '../../../layout/constants/sizes'
import Fonts from '../../../layout/constants/fonts'
import { Text } from '../../../components/Themed'
import ButtonLarge from '../../../components/buttons/large' 
import ButtonStandart from '../../../components/buttons/standart'

export default function SplashScreen() {
    const isDarkMode = useColorScheme() === 'dark'

    const container:any  = {
        flex: 1,
        backgroundColor: ColorTheme().background,
    }
    const header:any  = {
        alignitems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 100,
        color: ColorTheme().text,
    }
    const center:any  = {
        alignItems: 'center',
        position: 'absolute',
        justifyContent: 'center',
        bottom: 150,
        left: -30
    }
    const title:any  = {
        alignSelf: 'center',
        fontFamily: Fonts.family['Black-Italic'],
        fontSize: 44,
        color: ColorTheme().text,
        marginBottom: 44
    }
    const slogan:any  = {
        fontFamily: Fonts.family['Black-Italic'],
        alignSelf: 'center',
        width: 230,
        textAlign: 'center',
        fontSize: 18,
        color: ColorTheme().text
    }
    const buttons:any = {
        alignItems: 'center',
        position: 'absolute',
        justifyContent: 'center',
        bottom: 0
    }

    return (
        <View style={container}>
            <StatusBar barStyle={isDarkMode?'lght-content': 'dark-content'} translucent={true} backgroundColor={'transparent'}/>
                <View style={header}>
                    <Text style={title}>Circle</Text>
                    <Text style={slogan}>Share momments and create memories</Text>
                </View>
                <View style={center}>
                    <Image style={{width: 454, height: 430}} resizeMode='contain' source={require('../../../assets/images/bg/bg.png')}/>
                </View>
                <View style={buttons}>
                    <ButtonStandart
                        title={'I already have a account'}
                        transparent={true}
                        navigateTo={'SignInScreen'}
                    />
                    
                    <View style={{marginBottom: 10}}>
                        <ButtonLarge
                            title={"Let's Get Started"}
                            navigateTo={'Register'}
                        />
                    </View>
                </View>
        </View>
    )
}