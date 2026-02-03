import ColorTheme from "@/constants/colors"
import React from "react"
import type { ViewProps } from "react-native"
import { StyleSheet, View, Platform } from "react-native"
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
const START_DEBOUNCE_MS = 120
const STOP_DEBOUNCE_MS = 120
const STOP_CONFIRM_RETRY_MS = 250
const MAX_STOP_RETRIES = 3
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
    const startInProgressRef = React.useRef(false)
    const stopInProgressRef = React.useRef(false)
    const stopDebounceRef = React.useRef<NodeJS.Timeout | null>(null)
    const stopRetryCountRef = React.useRef(0)
    const releasePendingRef = React.useRef(false)
    const recordingProgress = useSharedValue(0)
    const isPressingButton = useSharedValue(false)
    const holdTimerRef = React.useRef<NodeJS.Timeout | null>(null)
    const onStoppedRecording = React.useCallback(() => {
        isRecording.current = false
        startInProgressRef.current = false
        stopInProgressRef.current = false
        stopRetryCountRef.current = 0
        if (stopDebounceRef.current) {
            clearTimeout(stopDebounceRef.current)
            stopDebounceRef.current = null
        }
        cancelAnimation(recordingProgress)
        if (props.onRecordingStop) props.onRecordingStop()
    }, [recordingProgress, props.onRecordingStop])

    const stopRecording = React.useCallback(async () => {
        if (camera.current == null) throw new Error("Camera ref is null!")
        // If a stop is already in-flight, ignore
        if (stopInProgressRef.current) {
            console.log("⏹️ stopRecording debounced (stop in progress)")
            return
        }

        // If we haven't started yet but start is in progress, mark release pending
        if (startInProgressRef.current && !isRecording.current) {
            console.log("⏹️ stopRecording queued (start in progress)")
            releasePendingRef.current = true
            return
        }

        // If not recording and no start in progress, just reset UI
        if (!isRecording.current && !startInProgressRef.current) {
            console.log("⏹️ stopRecording called but not recording; resetting UI")
            isPressingButton.value = false
            setIsPressingButton(false)
            return
        }

        // Debounce multiple stop calls in quick succession
        if (stopDebounceRef.current) {
            console.log("⏹️ stopRecording debounced (recent call)")
            return
        }
        stopDebounceRef.current = setTimeout(async () => {
            stopDebounceRef.current = null
            stopInProgressRef.current = true
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

                await camera.current!.stopRecording()
                // give the native bridge a tick to dispatch onRecordingFinished
                await new Promise((r) => setTimeout(r, 30))

                // confirm stop: if still marked as recording, retry a few times
                if (isRecording.current && stopRetryCountRef.current < MAX_STOP_RETRIES) {
                    stopRetryCountRef.current += 1
                    console.log(
                        `⏹️ Stop confirm retry ${stopRetryCountRef.current}/${MAX_STOP_RETRIES}`,
                    )
                    setTimeout(() => {
                        // Fire-and-forget retry
                        if (isRecording.current) {
                            camera.current
                                ?.stopRecording()
                                .catch(() => {})
                                .finally(() => {
                                    if (stopRetryCountRef.current >= MAX_STOP_RETRIES) {
                                        onStoppedRecording()
                                    }
                                })
                        }
                    }, STOP_CONFIRM_RETRY_MS)
                }
            } catch (e) {
                console.error("❌ Error stopping recording:", e)
                onStoppedRecording()
            } finally {
                stopInProgressRef.current = false
            }
        }, STOP_DEBOUNCE_MS)
    }, [camera, onStoppedRecording, isPressingButton, setIsPressingButton])

    const startRecording = React.useCallback(() => {
        if (camera.current == null) throw new Error("Camera ref is null!")
        // avoid double-starts
        if (isRecording.current || startInProgressRef.current) {
            console.log("⏺️ startRecording ignored (already recording or in progress)")
            return
        }
        startInProgressRef.current = true

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
                fileType: Platform.OS === "ios" ? "mov" : "mp4",
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
        } finally {
            // Release start-in-progress after a short debounce window
            setTimeout(() => {
                startInProgressRef.current = false
                // If user already released during start, stop now
                if (releasePendingRef.current) {
                    releasePendingRef.current = false
                    stopRecording()
                }
            }, START_DEBOUNCE_MS)
        }
    }, [
        camera,
        flash,
        onMediaCaptured,
        onStoppedRecording,
        props.onRecordingStart,
        stopRecording,
        isPressingButton,
        setIsPressingButton,
    ])
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
                        if (!isRecording.current && !startInProgressRef.current) {
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
                    // If we released during a start-in-progress, mark pending stop
                    if (startInProgressRef.current && !isRecording.current) {
                        releasePendingRef.current = true
                        return
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
            if (stopDebounceRef.current) clearTimeout(stopDebounceRef.current)
            startInProgressRef.current = false
            stopInProgressRef.current = false
            releasePendingRef.current = false
            stopRetryCountRef.current = 0
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
