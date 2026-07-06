import { useEffect } from "react"
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

// Purple drop-shadow that fades in behind the camera preview while recording.
// The animated style is applied to a wrapper view around the camera; the
// wrapper must NOT have overflow:hidden or iOS will clip the shadow layer.
export function useRecordingGlow(isRecording: boolean) {
    const value = useSharedValue(0)

    useEffect(() => {
        value.value = withTiming(isRecording ? 1 : 0, { duration: 350 })
    }, [isRecording, value])

    return useAnimatedStyle(() => ({
        shadowOpacity: value.value * 0.35,
        shadowRadius: 8 + value.value * 40,
    }))
}
