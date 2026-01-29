import ColorTheme from "@/constants/colors"
import React from "react"
import type { ViewProps } from "react-native"
import { StyleSheet, View } from "react-native"
import type { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler"
import { Gesture, GestureDetector, State, TapGestureHandler } from "react-native-gesture-handler"
import Reanimated, {
    cancelAnimation,
    Easing,
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import type { SharedValue } from "react-native-reanimated"
import type { Camera, PhotoFile, VideoFile } from "react-native-vision-camera"
import { CAPTURE_BUTTON_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants"

const START_RECORDING_DELAY = 200
const BORDER_WIDTH = CAPTURE_BUTTON_SIZE * 0.1

interface Props extends ViewProps {
    camera: React.RefObject<Camera>
    onMediaCaptured: (media: PhotoFile | VideoFile, type: "photo" | "video") => void

    minZoom: number
    maxZoom: number
    cameraZoom: SharedValue<number>

    flash: "off" | "on"

    enabled: boolean

    setIsPressingButton: (isPressingButton: boolean) => void
    onRecordingStart?: () => void
    onRecordingStop?: () => void
}

const CaptureButtonComponent: React.FC<Props> = ({
    camera,
    onMediaCaptured,
    minZoom,
    maxZoom,
    cameraZoom,
    flash,
    enabled,
    setIsPressingButton,
    style,
    ...props
}): React.ReactElement => {
    const autoStopTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const isRecording = React.useRef(false)
    const recordingProgress = useSharedValue(0)
    const isPressingButton = useSharedValue(false)
    const holdTimerRef = React.useRef<NodeJS.Timeout | null>(null)
    const onStoppedRecording = React.useCallback(() => {
        isRecording.current = false
        cancelAnimation(recordingProgress)
        if (props.onRecordingStop) props.onRecordingStop()
    }, [recordingProgress, props.onRecordingStop])

    const stopRecording = React.useCallback(async () => {
        if (camera.current == null) throw new Error("Camera ref is null!")
        if (!isRecording.current) {
            console.log("⏹️ stopRecording called but not currently recording; ignoring")
            // ensure UI resets in case of stale state
            isPressingButton.value = false
            setIsPressingButton(false)
            return
        }
        try {
            console.log("⏹️ Stopping recording…")
            // clear auto-stop timer
            if (autoStopTimeoutRef.current) {
                clearTimeout(autoStopTimeoutRef.current)
                autoStopTimeoutRef.current = null
            }
            // update UI immediately
            isPressingButton.value = false
            setIsPressingButton(false)
            await camera.current.stopRecording()
            // give the native bridge a tick to dispatch onRecordingFinished
            await new Promise((r) => setTimeout(r, 30))
        } catch (e) {
            console.error("❌ Error stopping recording:", e)
            onStoppedRecording()
        }
    }, [camera, onStoppedRecording, isPressingButton, setIsPressingButton])

    const startRecording = React.useCallback(() => {
        if (camera.current == null) throw new Error("Camera ref is null!")
        // avoid double-starts
        if (isRecording.current) {
            console.log("⏺️ startRecording called while already recording; ignoring")
            return
        }
        if (props.onRecordingStart) props.onRecordingStart()

        // Set state early to avoid race with release handler
        isRecording.current = true
        // reflect UI pressed/recording state
        isPressingButton.value = true
        setIsPressingButton(true)
        // auto-stop after 30s
        if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current)
        autoStopTimeoutRef.current = setTimeout(() => {
            if (isRecording.current) {
                // fire and forget
                stopRecording()
            }
        }, 30000)

        try {
            console.log("⏺️ Starting recording…")
            camera.current.startRecording({
                fileType: "mp4",
                flash: flash,
                onRecordingError: (error) => {
                    console.error("Recording failed!", error)
                    onStoppedRecording()
                },
                onRecordingFinished: (video) => {
                    console.log(`Recording successfully finished! ${video.path}`)
                    onMediaCaptured(video, "video")
                    onStoppedRecording()
                },
            })
        } catch (e) {
            console.error("❌ Error starting recording:", e)
            onStoppedRecording()
        }
    }, [camera, flash, onMediaCaptured, onStoppedRecording, props.onRecordingStart])
    //#endregion

    //#region Tap handler
    //@ts-ignore
    const tapHandler = React.useRef<TapGestureHandler>()
    const onHandlerStateChanged = React.useCallback(
        async ({ nativeEvent: event }: TapGestureHandlerStateChangeEvent) => {
            // Press-and-hold to record: start after a short delay on press-in; stop on release
            console.debug(`state: ${Object.keys(State)[event.state]}`)
            switch (event.state) {
                case State.BEGAN: {
                    // Visual feedback immediately
                    isPressingButton.value = true
                    setIsPressingButton(true)
                    // Arm delayed start to avoid short taps
                    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
                    holdTimerRef.current = setTimeout(() => {
                        if (!isRecording.current) {
                            try {
                                startRecording()
                            } catch {}
                        }
                    }, START_RECORDING_DELAY)
                    return
                }
                case State.CANCELLED:
                case State.FAILED:
                case State.END: {
                    // Release: clear pending start and stop if recording
                    if (holdTimerRef.current) {
                        clearTimeout(holdTimerRef.current)
                        holdTimerRef.current = null
                    }
                    if (isRecording.current) {
                        await stopRecording()
                    } else {
                        // Reset UI if not started
                        isPressingButton.value = false
                        setIsPressingButton(false)
                    }
                    return
                }
                default:
                    break
            }
        },
        [setIsPressingButton, startRecording, stopRecording],
    )
    //#endregion
    //#region Pan handler
    const panStartY = useSharedValue(0)
    const panOffsetY = useSharedValue(0)

    const panGesture = Gesture.Pan()
        .onBegin((event) => {
            "worklet"
            panStartY.value = event.absoluteY
            const yForFullZoom = panStartY.value * 0.7
            const offsetYForFullZoom = panStartY.value - yForFullZoom

            // extrapolate [0 ... 1] zoom -> [0 ... Y_FOR_FULL_ZOOM] finger position
            panOffsetY.value = interpolate(
                cameraZoom.value,
                [minZoom, maxZoom],
                [0, offsetYForFullZoom],
                Extrapolate.CLAMP,
            )
        })
        .onUpdate((event) => {
            "worklet"
            const offset = panOffsetY.value
            const startY = panStartY.value || SCREEN_HEIGHT
            const yForFullZoom = startY * 0.7

            cameraZoom.value = interpolate(
                event.absoluteY - offset,
                [yForFullZoom, startY],
                [maxZoom, minZoom],
                Extrapolate.CLAMP,
            )
        })
    //#endregion

    const shadowStyle = useAnimatedStyle(
        () => ({
            transform: [
                {
                    scale: withSpring(isPressingButton.value ? 1 : 0, {
                        mass: 1,
                        damping: 35,
                        stiffness: 300,
                    }),
                },
            ],
        }),
        [isPressingButton],
    )
    const buttonStyle = useAnimatedStyle(() => {
        let scale: number
        if (enabled) {
            if (isPressingButton.value) {
                scale = withRepeat(
                    withSpring(1, {
                        stiffness: 100,
                        damping: 1000,
                    }),
                    -1,
                    true,
                )
            } else {
                scale = withSpring(0.9, {
                    stiffness: 500,
                    damping: 300,
                })
            }
        } else {
            scale = withSpring(0.6, {
                stiffness: 500,
                damping: 300,
            })
        }

        return {
            opacity: withTiming(enabled ? 1 : 0.3, {
                duration: 100,
                easing: Easing.linear,
            }),
            transform: [
                {
                    scale: scale,
                },
            ],
        }
    }, [enabled, isPressingButton])

    React.useEffect(() => {
        return () => {
            if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
            if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current)
        }
    }, [])

    return (
        <TapGestureHandler
            enabled={enabled}
            ref={tapHandler}
            onHandlerStateChange={onHandlerStateChanged}
            shouldCancelWhenOutside={false}
            maxDurationMs={99999999} // <-- this prevents the TapGestureHandler from going to State.FAILED when the user moves his finger outside of the child view (to zoom)
        >
            <Reanimated.View {...props} style={[buttonStyle, style]}>
                <GestureDetector gesture={panGesture}>
                    <Reanimated.View style={styles.flex}>
                        <Reanimated.View style={[styles.shadow, shadowStyle]} />
                        <View style={styles.button} />
                    </Reanimated.View>
                </GestureDetector>
            </Reanimated.View>
        </TapGestureHandler>
    )
}

export const CaptureButton = React.memo(CaptureButtonComponent)

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    shadow: {
        position: "absolute",
        width: CAPTURE_BUTTON_SIZE,
        height: CAPTURE_BUTTON_SIZE,
        borderRadius: CAPTURE_BUTTON_SIZE / 2,
        backgroundColor: ColorTheme().primary,
    },
    button: {
        width: CAPTURE_BUTTON_SIZE,
        height: CAPTURE_BUTTON_SIZE,
        borderRadius: CAPTURE_BUTTON_SIZE / 2,
        borderWidth: BORDER_WIDTH,
        borderColor: "white",
    },
})
