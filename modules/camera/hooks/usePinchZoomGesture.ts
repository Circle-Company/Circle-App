import { Gesture } from "react-native-gesture-handler"
import {
    Extrapolate,
    interpolate,
    useSharedValue,
    type SharedValue,
} from "react-native-reanimated"

const SCALE_FULL_ZOOM = 3

// Two-finger pinch controls camera zoom. Ignored while the user is holding
// the capture button in press-and-hold mode — that gesture owns the zoom
// shared value via its vertical-drag interaction and we don't want them
// fighting.
//
// In hands-free mode there's no finger on the capture button (the tap
// already ended even though `isPressingButton` stays true to keep the
// recording indicator lit), so the pinch is unblocked via `handsFree`.
export function usePinchZoomGesture(
    zoom: SharedValue<number>,
    isPressingButton: SharedValue<boolean>,
    handsFree: SharedValue<boolean>,
    minZoom: number,
    maxZoom: number,
) {
    const startZoom = useSharedValue(0)

    return Gesture.Pinch()
        .onBegin(() => {
            "worklet"
            startZoom.value = zoom.value
        })
        .onUpdate((event) => {
            "worklet"
            if (isPressingButton.value && !handsFree.value) return
            const scale = interpolate(
                event.scale,
                [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
                [-1, 0, 1],
                Extrapolate.CLAMP,
            )
            zoom.value = interpolate(
                scale,
                [-1, 0, 1],
                [minZoom, startZoom.value, maxZoom],
                Extrapolate.CLAMP,
            )
        })
}
