import React from "react"
import { Animated, Pressable } from "react-native"
import ColorTheme from "../../constants/colors"
import sizes from "../../constants/sizes"

type HeaderButtonProps = {
    height?: number
    square?: boolean
    marginRight?: boolean
    marginLeft?: boolean
    color?: string
    children: React.ReactNode
    action(): void
}

export default function HeaderButton({
    height = sizes.buttons.height * 0.5,
    square = false,
    marginRight = false,
    marginLeft = false,
    color = String(ColorTheme().backgroundDisabled),
    children,
    action,
}: HeaderButtonProps) {
    const animatedScale = React.useRef(new Animated.Value(1)).current
    React.useEffect(() => {
        animatedScale.setValue(1)
    }, [])
    const HandleButtonAnimation = () => {
        animatedScale.setValue(0.8)
        Animated.spring(animatedScale, {
            toValue: 1,
            bounciness: 12,
            speed: 10,
            useNativeDriver: true,
        }).start()
    }

    const container: any = {
        width: square ? height : "auto",
        alignItems: "center",
        justifyContent: "center",
        height: height,
        borderRadius: height / 2,
    }

    async function onPress() {
        action()
        HandleButtonAnimation()
    }
    return (
        <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
            <Pressable style={container} onPress={onPress}>
                {children}
            </Pressable>
        </Animated.View>
    )
}
