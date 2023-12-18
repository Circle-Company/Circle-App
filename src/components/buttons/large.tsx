import React, { useRef, useEffect } from 'react'
import { Text, View, Dimensions, useColorScheme, Image, Pressable, Animated } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import ColorTheme from '../../layout/constants/colors'
import Sizes from '../../layout/constants/sizes'
import Fonts from '../../layout/constants/fonts'

const Right = require('../../assets/icons/pngs/24/arrow-right.png')
const Left = require('../../assets/icons/pngs/24/arrow-up.png')
const Up = require('../../assets/icons/pngs/24/arrow-up.png')
const Down = require('../../assets/icons/pngs/24/arrow-down.png')

export default function Buttonlarge(props:any) {

    const navigation = useNavigation()
    const isDarkMode = useColorScheme() === 'dark'

    var animatedScale = useRef(new Animated.Value(0)).current


    useEffect(() => { animatedScale.setValue(1) }, [])
    const handleButtonPress = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true
        }).start()
    }

    const container:any = {
    }
    const buttonContainer:any = {
        backgroundColor: ColorTheme().backgroundAccent,
        ...Sizes.buttons
    }
    const text:any = {
        fontFamily: Fonts.family['Medium-Italic'],
        fontSize: 16,
        color: ColorTheme().textAccent
    }
    const textContainer:any = {
        marginLeft: 5,
        justifyContent: 'center',
        flex: 1
    }
    const icon:any = {
        width: 24,
        height: 24,
        tintColor: ColorTheme().textAccent
    }
    const iconContainer:any = {
        marginLeft: 38,
        width: 28,
        borderRadius: 28 / 2,
        height: 28,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorTheme().textAccent
    }

    return (
        <View style={container}>
            <Pressable onPress={(n) => { handleButtonPress(), navigation.navigate(props.navigateTo) }}>
                <Animated.View
                    style={[buttonContainer, { transform: [{ scale: animatedScale }] }]}
                >
                    <View style={textContainer}>
                        <Text style={text}>{props.title}</Text>
                    </View>

                    <View style={iconContainer}>
                        <Image source={Right} style={icon} resizeMode='contain' />
                    </View>
                </Animated.View>

            </Pressable>
        </View>

    )
}