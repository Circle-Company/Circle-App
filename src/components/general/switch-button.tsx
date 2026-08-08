import React from "react"
import { StyleSheet, TouchableWithoutFeedback, useColorScheme, Platform } from "react-native"
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated"
import { colors } from "@/constants/colors"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { Host, Toggle } from "@expo/ui/swift-ui"
import { tint } from "@expo/ui/swift-ui/modifiers"

interface SwitchButtonProps {
    onPressEnable: () => void
    onPressDisable: () => void
    initialState?: boolean
}

export const SwitchButton: React.FC<SwitchButtonProps> = ({
    onPressEnable,
    onPressDisable,
    initialState = false,
}) => {
    const isDarkMode = useColorScheme() === "dark"

    // Animação (Android/others)
    const switchTranslateX = useSharedValue(initialState ? 23 : 3)
    const isEnabled = useSharedValue(initialState)

    // Estado controlado para iOS SwiftUI Switch
    const [checked, setChecked] = React.useState<boolean>(initialState)

    // Função única de toggle
    const toggle = (next: boolean) => {
        if (next) {
            Vibrate("effectClick")
            switchTranslateX.value = withSpring(23, {
                stiffness: 1000,
                damping: 33,
            })
            isEnabled.value = true
            onPressEnable()
        } else {
            Vibrate("impactLight")
            switchTranslateX.value = withSpring(2, {
                stiffness: 1000,
                damping: 60,
            })
            isEnabled.value = false
            onPressDisable()
        }
        setChecked(next)
    }

    const handlePress = () => {
        toggle(!isEnabled.value)
    }

    const animatedTrackStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                switchTranslateX.value,
                [3, 23],
                [
                    isDarkMode ? colors.gray.grey_06 : colors.gray.grey_03,
                    isDarkMode ? colors.gray.white : colors.gray.black,
                ],
            ),
        }
    })

    const animatedCircleStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: switchTranslateX.value }],
            backgroundColor: interpolateColor(
                switchTranslateX.value,
                [0, 23],
                [
                    isDarkMode ? colors.gray.black : colors.gray.white,
                    isDarkMode ? colors.gray.black : colors.gray.white,
                ],
            ),
            width: withSpring(isEnabled.value ? 26 : 22, {
                stiffness: 500,
                damping: 30,
            }),
            height: withSpring(isEnabled.value ? 26 : 22, {
                stiffness: 500,
                damping: 30,
            }),
        }
    })

    // iOS: usar SwiftUI Switch controlado
    if (Platform.OS === "ios") {
        return (
            <Host matchContents>
                <Toggle
                    isOn={checked}
                    onIsOnChange={(next: boolean) => toggle(next)}
                    label=""
                    modifiers={[tint(colors.purple.purple_05)]}
                />
            </Host>
        )
    }

    // Android / Others: Touchable + Animated
    return (
        <TouchableWithoutFeedback onPress={handlePress}>
            <Animated.View style={[styles.track, animatedTrackStyle]}>
                <Animated.View style={[styles.circle, animatedCircleStyle]} />
            </Animated.View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    circle: {
        borderRadius: 40,
        height: 24,
        width: 24,
    },
    track: {
        borderRadius: 17,
        height: 30,
        justifyContent: "center",
        padding: 2,
        width: 54,
    },
})
