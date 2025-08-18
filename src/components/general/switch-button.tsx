import React from "react"
import { StyleSheet, TouchableWithoutFeedback, useColorScheme } from "react-native"
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated"
import { colors } from "../../constants/colors"
import { Vibrate } from "../../lib/hooks/useHapticFeedback"

interface SwitchButtonProps {
    onPressEnable: () => void
    onPressDisable: () => void
    initialState?: boolean // Novo estado inicial
}

export const SwitchButton: React.FC<SwitchButtonProps> = ({
    onPressEnable,
    onPressDisable,
    initialState = false, // Valor padrão para o estado inicial
}) => {
    const switchTranslateX = useSharedValue(initialState ? 23 : 3)
    const isEnabled = useSharedValue(initialState)
    const isDarkMode = useColorScheme() === "dark"

    const handlePress = () => {
        if (isEnabled.value) {
            Vibrate("impactLight")
            switchTranslateX.value = withSpring(2, {
                stiffness: 1000,
                damping: 60,
            })
            isEnabled.value = false
            onPressDisable()
        } else {
            Vibrate("effectClick")
            switchTranslateX.value = withSpring(23, {
                stiffness: 1000,
                damping: 33,
            })
            isEnabled.value = true
            onPressEnable()
        }
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
