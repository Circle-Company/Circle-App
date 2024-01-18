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
    margins?: boolean,
    action(): void,
}

export default function button_standart({
    width = sizes.buttons.height*0.5,
    height = sizes.buttons.height*0.5,
    backgroundColor = String(ColorTheme().backgroundDisabled),
    children,
    margins = true,
    action,
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
        marginRight: margins? sizes.margins['3sm']: 0,
        width: width,
        height: height,
        borderRadius: (width)/2
    }

    const badge_style = {
        zIndex: 10,
        position: 'absolute',
        top: -10,
        right: -10,
        width: 10,
        height: 10,
        backgroundColor: ColorTheme().error
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