import React from 'react'
import { Pressable, View, Text, Animated} from 'react-native'
import ColorTheme from '../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import Camera from '../../../assets/icons/svgs/camera.svg'
import sizes from '../../layout/constants/sizes'
import fonts from '../../layout/constants/fonts'

type ButtonStandartProps = {
    width?: number,
    height?: number,
    backgroundColor?: string,
    children: React.ReactNode,
    action(): void
}

export default function button_standart({
    width = sizes.buttons.height*0.5,
    height = sizes.buttons.height*0.5,
    backgroundColor = String(ColorTheme().backgroundDisabled),
    children,
    action
}: ButtonStandartProps) {

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

    const container: any = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: backgroundColor,
        marginRight: sizes.margins['3sm'],
        width: width,
        height: height,
        borderRadius: (width)/2
    }

    async function onPress() {
        HandleButtonAnimation()
        console.log('HeaderButton Pressed')
        action()
    }
    return(
        <Animated.View style={{transform: [{ scale: animatedScale }] }}>
            <Pressable style={container} onPress={onPress}>
                {children}
            </Pressable>
        </Animated.View>  
    )
}