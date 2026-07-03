import { useState } from "react"
import { runOnJS, useAnimatedReaction, type SharedValue } from "react-native-reanimated"

// Bridges the UI-thread zoom shared value to a JS-side display string.
// Only updates when the rounded value changes, so the 60fps zoom worklet
// doesn't fire 60 React re-renders per second.
export function useZoomDisplay(zoom: SharedValue<number>): string {
    const [display, setDisplay] = useState("1.0x")
    useAnimatedReaction(
        () => Math.round(zoom.value * 10) / 10,
        (rounded, prev) => {
            if (rounded !== prev) runOnJS(setDisplay)(`${rounded.toFixed(1)}x`)
        },
        [],
    )
    return display
}
