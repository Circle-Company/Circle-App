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
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import type { SharedValue } from "react-native-reanimated"
import type { Camera, PhotoFile, VideoFile } from "react-native-vision-camera"
import { CAPTURE_BUTTON_SIZE, SCREEN_HEIGHT } from "../constants"

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
}) => {
    const mountedRef = React.useRef(true)

    const autoStopTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const holdTimerRef = React.useRef<NodeJS.Timeout | null>(null)
    const stopDebounceRef = React.useRef<NodeJS.Timeout | null>(null)

    const isRecording = React.useRef(false)
    const startInProgressRef = React.useRef(false)
    const stopInProgressRef = React.useRef(false)
    const releasePendingRef = React.useRef(false)
    const stopRetryCountRef = React.useRef(0)

    const recordingProgress = useSharedValue(0)
    const isPressingButton = useSharedValue(false)

    React.useEffect(() => {
        return () => {
            mountedRef.current = false
        }
    }, [])

    const safeSetPressing = React.useCallback(
        (value: boolean) => {
            if (!mountedRef.current) return
            isPressingButton.value = value
            setIsPressingButton(value)
        },
        [setIsPressingButton],
    )

    const onStoppedRecording = React.useCallback(() => {
        if (!mountedRef.current) return

        isRecording.current = false
        startInProgressRef.current = false
        stopInProgressRef.current = false
        releasePendingRef.current = false
        stopRetryCountRef.current = 0

        if (stopDebounceRef.current) {
            clearTimeout(stopDebounceRef.current)
            stopDebounceRef.current = null
        }

        cancelAnimation(recordingProgress)
        safeSetPressing(false)

        props.onRecordingStop?.()
    }, [props.onRecordingStop, recordingProgress, safeSetPressing])

    const stopRecording = React.useCallback(async () => {
        if (!mountedRef.current) return
        if (!camera.current) return
        if (stopInProgressRef.current) return

        if (startInProgressRef.current && !isRecording.current) {
            releasePendingRef.current = true
            return
        }

        if (!isRecording.current) {
            safeSetPressing(false)
            return
        }

        if (stopDebounceRef.current) return

        stopDebounceRef.current = setTimeout(async () => {
            stopDebounceRef.current = null
            stopInProgressRef.current = true

            try {
                if (autoStopTimeoutRef.current) {
                    clearTimeout(autoStopTimeoutRef.current)
                    autoStopTimeoutRef.current = null
                }

                safeSetPressing(false)
                await camera.current?.stopRecording()

                await new Promise((r) => setTimeout(r, 30))

                if (isRecording.current && stopRetryCountRef.current < MAX_STOP_RETRIES) {
                    stopRetryCountRef.current += 1
                    setTimeout(() => {
                        camera.current
                            ?.stopRecording()
                            .catch(() => {})
                            .finally(() => {
                                if (stopRetryCountRef.current >= MAX_STOP_RETRIES) {
                                    onStoppedRecording()
                                }
                            })
                    }, STOP_CONFIRM_RETRY_MS)
                }
            } catch {
                onStoppedRecording()
            } finally {
                stopInProgressRef.current = false
            }
        }, STOP_DEBOUNCE_MS)
    }, [camera, onStoppedRecording, safeSetPressing])

    const startRecording = React.useCallback(() => {
        if (!mountedRef.current) return
        if (!camera.current) return
        if (isRecording.current || startInProgressRef.current) return

        startInProgressRef.current = true
        isRecording.current = true

        props.onRecordingStart?.()
        safeSetPressing(true)

        if (autoStopTimeoutRef.current) {
            clearTimeout(autoStopTimeoutRef.current)
        }

        autoStopTimeoutRef.current = setTimeout(() => {
            if (isRecording.current) stopRecording()
        }, 30000)

        try {
            camera.current.startRecording({
                fileType: Platform.OS === "ios" ? "mov" : "mp4",
                flash,
                onRecordingError: () => {
                    onStoppedRecording()
                },
                onRecordingFinished: (video) => {
                    if (!mountedRef.current) return
                    onMediaCaptured(video, "video")
                    onStoppedRecording()
                },
            })
        } catch {
            onStoppedRecording()
        } finally {
            setTimeout(() => {
                startInProgressRef.current = false
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
        safeSetPressing,
        stopRecording,
    ])

    const tapHandler = React.useRef<TapGestureHandler>(null)

    const onHandlerStateChanged = React.useCallback(
        async ({ nativeEvent }: TapGestureHandlerStateChangeEvent) => {
            switch (nativeEvent.state) {
                case State.BEGAN:
                    safeSetPressing(true)
                    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
                    holdTimerRef.current = setTimeout(startRecording, START_RECORDING_DELAY)
                    break

                case State.CANCELLED:
                case State.FAILED:
                case State.END:
                    if (holdTimerRef.current) {
                        clearTimeout(holdTimerRef.current)
                        holdTimerRef.current = null
                    }
                    if (isRecording.current) {
                        await stopRecording()
                    } else {
                        safeSetPressing(false)
                    }
                    break
            }
        },
        [safeSetPressing, startRecording, stopRecording],
    )

    const panStartY = useSharedValue(0)
    const panOffsetY = useSharedValue(0)

    const handleReleaseFromPan = React.useCallback(() => {
        if (isRecording.current) {
            stopRecording()
        } else {
            safeSetPressing(false)
        }
    }, [stopRecording, safeSetPressing])

    const panGesture = Gesture.Pan()
        .onBegin((event) => {
            "worklet"
            panStartY.value = event.absoluteY

            const yForFullZoom = panStartY.value * 0.7
            panOffsetY.value = interpolate(
                cameraZoom.value,
                [minZoom, maxZoom],
                [0, panStartY.value - yForFullZoom],
                Extrapolate.CLAMP,
            )
        })
        .onUpdate((event) => {
            "worklet"
            const startY = panStartY.value || SCREEN_HEIGHT

            cameraZoom.value = interpolate(
                event.absoluteY - panOffsetY.value,
                [startY * 0.7, startY],
                [maxZoom, minZoom],
                Extrapolate.CLAMP,
            )
        })
        .onFinalize(() => {
            // ⏹️ STOP DE GRAVAÇÃO (JS THREAD)
            runOnJS(handleReleaseFromPan)()
        })

    const shadowStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: withSpring(isPressingButton.value ? 1 : 0),
            },
        ],
    }))

    const buttonStyle = useAnimatedStyle(() => ({
        opacity: withTiming(enabled ? 1 : 0.3),
        transform: [
            {
                scale: enabled
                    ? isPressingButton.value
                        ? withRepeat(withSpring(1), -1, true)
                        : withSpring(0.9)
                    : withSpring(0.6),
            },
        ],
    }))

    return (
        <TapGestureHandler
            ref={tapHandler}
            enabled={enabled}
            onHandlerStateChange={onHandlerStateChanged}
            shouldCancelWhenOutside={false}
            maxDurationMs={99999999}
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
        margin: 25,
        width: CAPTURE_BUTTON_SIZE - 50,
        height: CAPTURE_BUTTON_SIZE - 50,
        borderRadius: CAPTURE_BUTTON_SIZE * 0.1,
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
