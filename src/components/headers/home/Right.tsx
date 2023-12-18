import React from 'react';
import { Pressable, View, Text, Animated} from 'react-native';
import ColorTheme from '../../../layout/constants/colors';
import {useNavigation} from '@react-navigation/native';
import Camera from '../../../assets/icons/svgs/camera.svg'
import sizes from '../../../layout/constants/sizes';
import fonts from '../../../layout/constants/fonts';

export default function HeaderRightHome() {

    var animatedScale = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => { animatedScale.setValue(1) }, [])
    const HandleButtonAnimation = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true
        }).start()
    }

    const navigation = useNavigation()

    const container: any = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ColorTheme().backgroundDisabled,
        marginRight: sizes.margins['3sm'],
        width: sizes.buttons.width*0.45,
        height: sizes.buttons.height*0.5,
        borderRadius: (sizes.buttons.height*0.5)/2
    }
    const text: any = {
        fontSize: fonts.size.footnote,
        fontFamily: fonts.family.Bold,
        color: ColorTheme().text
    }
    const textContainer = {
        marginRight: sizes.margins['2sm']
    }

    async function onPress() {
        HandleButtonAnimation()
        console.log('New Moment Pressed')
        navigation.navigate('SettingsNavigator')
    }
    return(
        <Animated.View style={{transform: [{ scale: animatedScale }] }}>
            <Pressable style={container} onPress={() => {onPress()}}>
                <View style={textContainer}>
                    <Text style={text}>New Moment</Text>
                </View>
                
                <Camera fill={String(ColorTheme().text)} width={16} height={16}/>
            </Pressable>
        </Animated.View>  
    )
}