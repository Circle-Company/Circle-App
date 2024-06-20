import React from 'react'
import { Pressable, View, Text, Animated} from 'react-native'
import ColorTheme from '../../layout/constants/colors'
import {useNavigation} from '@react-navigation/native'
import Camera from '../../../assets/icons/svgs/camera.svg'
import sizes from '../../layout/constants/sizes'
import fonts from '../../layout/constants/fonts'

type ButtonStandartProps = {
    bounciness?: number
    animationScale?: number
    width?: number | string,
    height?: number,
    backgroundColor?: string,
    children: React.ReactNode,
    margins?: boolean
    borderRadius?: number
    action(): void,
}

export default function button_standart({
    bounciness = 12,
    animationScale = 0.8,
    width = sizes.buttons.height*0.5,
    height = sizes.buttons.height*0.5,
    backgroundColor = String(ColorTheme().backgroundDisabled),
    children,
    margins = true,
    borderRadius = Number(width)/2,
    action,
}: ButtonStandartProps) {

    var animatedScale = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => { animatedScale.setValue(1) }, [])
    const HandleButtonAnimation = () => {
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: bounciness,
            speed: 10,
            useNativeDriver: true
        }).start()
    }

    const HandlePressIn = () => {
        Animated.spring(animatedScale, {
            toValue: animationScale,
            bounciness: bounciness,
            speed: 20,
            useNativeDriver: true
        }).start()
    }

    const container: any = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: backgroundColor,
        marginRight: margins? sizes.margins['3sm']: 0,
        width: width,
        height: height,
        borderRadius: borderRadius
    }


    async function onPress() {
        HandleButtonAnimation
        action()
    }
    return(
        <Animated.View style={{transform: [{ scale: animatedScale }] }}>
            <Pressable style={container} onPressIn={HandlePressIn} onPressOut={HandleButtonAnimation} onPress={onPress}>{children}</Pressable>
        </Animated.View>          

    )
}