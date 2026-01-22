import { useEffect } from "react"
import { Keyboard, KeyboardEvent, Platform } from "react-native"
import {
    interpolate as reanimatedInterpolate,
    SharedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"

function createInterpolatable(value: SharedValue<number>) {
    "worklet"
    return (inputRange: [number, number], outputRange: [number, number]): number => {
        "worklet"
        return reanimatedInterpolate(value.value, inputRange, outputRange)
    }
}

export type UseKeyboardReturn = {
    height: SharedValue<number>
    visible: SharedValue<boolean>
    progress: SharedValue<number>
    keyboardIsVisible: SharedValue<boolean>
    interpolateHeight: ReturnType<typeof createInterpolatable>
    interpolateProgress: ReturnType<typeof createInterpolatable>
}

export function useKeyboard(): UseKeyboardReturn {
    const height = useSharedValue(0)
    const visible = useSharedValue(false)
    const progress = useSharedValue(0)
    const keyboardIsVisible = useSharedValue(false)

    const interpolateHeight = createInterpolatable(height)
    const interpolateProgress = createInterpolatable(progress)

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

        const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
            const keyboardH = e.endCoordinates?.height ?? 0
            height.value = withTiming(keyboardH, { duration: 250 })
            progress.value = withTiming(1, { duration: 250 })

            visible.value = true
            keyboardIsVisible.value = true
        })

        const hideSub = Keyboard.addListener(hideEvent, () => {
            height.value = withTiming(0, { duration: 250 })
            progress.value = withTiming(0, { duration: 250 })

            visible.value = false
            keyboardIsVisible.value = false
        })

        return () => {
            showSub.remove()
            hideSub.remove()
        }
    }, [])

    return {
        height,
        visible,
        progress,
        keyboardIsVisible,
        interpolateHeight,
        interpolateProgress,
    }
}
