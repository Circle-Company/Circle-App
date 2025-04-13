import React from "react"
import { Animated, Pressable, StyleProp, ViewStyle } from "react-native"
import ColorTheme from "../../layout/constants/colors"
import sizes from "../../layout/constants/sizes"

export interface ButtonStandartProps {
    style?: StyleProp<ViewStyle>
    testID?: string
    bounciness?: number
    animationScale?: number
    width?: number | string
    height?: number
    backgroundColor?: string
    children: React.ReactNode
    margins?: boolean
    borderRadius?: number
    action(): void
    vibrate?: () => void
}

export default function ButtonStandart({
    style,
    bounciness = 12,
    animationScale = 0.8,
    width = sizes.buttons.height * 0.5,
    height = sizes.buttons.height * 0.5,
    backgroundColor = String(ColorTheme().backgroundDisabled),
    children,
    margins = true,
    borderRadius = typeof width === "number" ? width / 2 : 50,
    testID,
    action,
    vibrate,
}: ButtonStandartProps) {
    const animatedScale = React.useRef(new Animated.Value(1)).current

    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [animatedScale])

    const handleButtonAnimation = () => {
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: bounciness,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }

    const handlePressIn = () => {
        Animated.spring(animatedScale, {
            toValue: animationScale,
            bounciness: bounciness,
            speed: 20,
            useNativeDriver: true,
        }).start()
    }

    const container: StyleProp<ViewStyle> = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: backgroundColor,
        marginRight: margins ? sizes.margins["3sm"] : 0,
        width: width,
        height: height,
        borderRadius: borderRadius,
        // @ts-ignore
        ...style,
    }

    async function onPress() {
        handleButtonAnimation()
        if (vibrate) vibrate()
        action()
    }

    return (
        <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
            <Pressable
                testID={testID}
                style={container}
                onPressIn={handlePressIn}
                onPressOut={handleButtonAnimation}
                onPress={onPress}
            >
                {children}
            </Pressable>
        </Animated.View>
    )
}
