import React from "react"
import { Pressable } from "react-native"
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { SymbolView } from "expo-symbols"
import Camera from "@/assets/icons/svgs/camera.svg"
import { colors } from "@/constants/colors"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type ProfilePictureEditButtonProps = {
    size: number
    onPress?: () => void
}

export function ProfilePictureEditButton({ size, onPress }: ProfilePictureEditButtonProps) {
    const pressed = useSharedValue(0)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 + pressed.value * 0.12 }],
        backgroundColor: interpolateColor(
            pressed.value,
            [0, 1],
            [colors.gray.grey_06, colors.gray.grey_05],
        ),
    }))

    const handlePressIn = () => {
        pressed.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.quad) })
    }

    const handlePressOut = () => {
        pressed.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) })
    }

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Edit profile picture"
            style={[
                {
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: 6,
                    borderColor: colors.gray.black,
                    alignItems: "center",
                    justifyContent: "center",
                },
                animatedStyle,
            ]}
        >
            <SymbolView
                name="pencil"
                tintColor={colors.gray.white}
                size={size * 0.4}
                weight="bold"
                fallback={
                    <Camera width={size * 0.55} height={size * 0.55} fill={colors.gray.white} />
                }
            />
        </AnimatedPressable>
    )
}
