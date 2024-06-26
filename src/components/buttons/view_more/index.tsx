import React from 'react'
import { Animated, Pressable} from 'react-native'
import { Text, View } from '../../Themed'
import {useNavigation} from '@react-navigation/native'
import ColorTheme from '../../../layout/constants/colors'
import fonts from '../../../layout/constants/fonts'

import ChevronRight from '../../../assets/icons/svgs/chevron_right.svg'
import sizes from '../../../layout/constants/sizes'

type ViewMorePuttonProps = {
    action(): Promise<void>,
    icon?: React.ReactNode | null,
    text?: string,
    scale?: number,
    fontSize?: number,
    fontFamily?: string,
}

export default function ViewMorebutton({
    action,
    text = 'View More',
    scale = 1,
    fontSize = fonts.size.caption1* 1.05,
    fontFamily = fonts.family.Semibold,
    icon = <ChevronRight fill={String(ColorTheme().primary)} width={11 * scale} height={11 * scale}/>
}: ViewMorePuttonProps) {

    const navigation = useNavigation()
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
        paddingVertical: 4 * scale,
    }
    const text_style: any = {
        marginRight: sizes.margins['1sm'] * scale,
        fontSize: fontSize * scale,
        fontFamily: fontFamily,
        color: ColorTheme().primary
    }
    async function onPressAction() {
        HandleButtonAnimation()
        action()
        console.log('View More Pressed')
    }

    return (
        <Pressable onPress={() => {onPressAction()}}>
            <Animated.View style={[container, {transform: [{ scale: animatedScale }] }]}>
                <Text style={text_style}>{text}</Text>
                {icon}
            </Animated.View>            
        </Pressable>

    )
}