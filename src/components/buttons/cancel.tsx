import React from "react"
import { Animated, Pressable } from "react-native"
import ColorTheme from "../../constants/colors"
import fonts from "../../constants/fonts"
import sizes from "../../constants/sizes"
import { Text } from "../Themed"

type ButtonStandartProps = {
    style?: any
    text: string
    textColor?: string
    bounciness?: number
    animationScale?: number
    width?: number | string
    height?: number
    action(): void
    vibrate?: () => void
}

export default function CancelButton({
    style,
    text,
    textColor = ColorTheme().error,
    bounciness = 12,
    animationScale = 0.8,
    width = "100%",
    height = sizes.buttons.height * 0.5,
    action,
    vibrate,
}: ButtonStandartProps) {
    const animatedScale = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [])
    const HandleButtonAnimation = () => {
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: bounciness,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }

    const HandlePressIn = () => {
        Animated.spring(animatedScale, {
            toValue: animationScale,
            bounciness: bounciness,
            speed: 20,
            useNativeDriver: true,
        }).start()
    }

    const container: any = {
        alignItems: "center",
        justifyContent: "center",
        width: width,
        height: height,
        ...style,
    }

    const textStyle: any = {
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Medium,
        color: textColor,
    }

    async function onPress() {
        HandleButtonAnimation
        if (vibrate) vibrate()
        action()
    }
    return (
        <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
            <Pressable
                style={container}
                onPressIn={HandlePressIn}
                onPressOut={HandleButtonAnimation}
                onPress={onPress}
            >
                <Text style={textStyle}>{text}</Text>
            </Pressable>
        </Animated.View>
    )
}
