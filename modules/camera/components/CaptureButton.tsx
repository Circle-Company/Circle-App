import ColorTheme from "@/constants/colors"
import React from "react"
import type { ViewProps } from "react-native"
import { StyleSheet, View } from "react-native"
import type { TapGestureHandlerStateChangeEvent } from "react-native-gesture-handler"
import { Gesture, GestureDetector, State, TapGestureHandler } from "react-native-gesture-handler"
import Reanimated, {
    cancelAnimation,
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
import type { CameraVideoOutput, Recorder } from "react-native-vision-camera"
import { CAPTURE_BUTTON_SIZE, SCREEN_HEIGHT } from "../constants"

// Video-only capture: press starts recording immediately (no delay/long-press).
const START_RECORDING_DELAY = 0
const START_DEBOUNCE_MS = 120
const STOP_DEBOUNCE_MS = 120
// Minimum hold time before allowing stop. Prevents accidental sub-second clips
// from the async createRecorder/startRecording chain finishing right as the user
// releases — gives AVAssetWriter enough samples to finalize a valid file.
const MIN_RECORDING_MS = 600
const BORDER_WIDTH = CAPTURE_BUTTON_SIZE * 0.1

interface Props extends ViewProps {
    videoOutput: CameraVideoOutput
    onMediaCaptured: (filePath: string, duration: number) => void
    minZoom: number
    maxZoom: number
    cameraZoom: SharedValue<number>
    enabled: boolean
    setIsPressingButton: (isPressingButton: boolean) => void
    onRecordingStart?: () => void
    onRecordingStop?: () => void
}

const CaptureButtonComponent: React.FC<Props> = ({
    videoOutput,
    onMediaCaptured,
    minZoom,
    maxZoom,
    cameraZoom,
    enabled,
    setIsPressingButton,
    style,
    ...props
}) => {
    const mountedRef = React.useRef(true)

    const autoStopTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const holdTimerRef = React.useRef<NodeJS.Timeout | null>(null)
    const stopDebounceRef = React.useRef<NodeJS.Timeout | null>(null)
    const recorderRef = React.useRef<Recorder | null>(null)
    const recordingStartedAtRef = React.useRef<number>(0)

    const isRecording = React.useRef(false)
    const startInProgressRef = React.useRef(false)
    const stopInProgressRef = React.useRef(false)
    // True if user released the button while startRecording was still in flight.
    // When the recorder finally becomes active, we honor the release immediately.
    const releasePendingRef = React.useRef(false)

    const recordingProgress = useSharedValue(0)
    const isPressingButton = useSharedValue(false)

    React.useEffect(() => {
        return () => {
            mountedRef.current = false
            // Cancel any in-flight recording when unmounted.
            if (recorderRef.current) {
                recorderRef.current.cancelRecording().catch(() => {})
                recorderRef.current = null
            }
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
        recorderRef.current = null

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
        if (stopInProgressRef.current) return
        if (!isRecording.current || !recorderRef.current) {
            safeSetPressing(false)
            return
        }
        if (stopDebounceRef.current) return

        // Enforce minimum recording duration: if user released before MIN_RECORDING_MS,
        // wait the remainder before actually stopping. This avoids sub-second files
        // that AVAssetWriter can't finalize cleanly (0-frame clips, codec errors).
        const elapsedMs = Date.now() - recordingStartedAtRef.current
        const debounceMs = Math.max(STOP_DEBOUNCE_MS, MIN_RECORDING_MS - elapsedMs)

        stopDebounceRef.current = setTimeout(async () => {
            stopDebounceRef.current = null
            stopInProgressRef.current = true

            if (autoStopTimeoutRef.current) {
                clearTimeout(autoStopTimeoutRef.current)
                autoStopTimeoutRef.current = null
            }

            safeSetPressing(false)
            try {
                await recorderRef.current?.stopRecording()
            } catch (e) {
                // If stop fails, force-cleanup.
                onStoppedRecording()
            } finally {
                stopInProgressRef.current = false
            }
        }, debounceMs)
    }, [onStoppedRecording, safeSetPressing])

    const startRecording = React.useCallback(async () => {
        if (!mountedRef.current) return
        if (!videoOutput) return
        if (isRecording.current || startInProgressRef.current) return

        startInProgressRef.current = true

        try {
            // Retry createRecorder until the output is attached to the session.
            // vision-camera v5 fires `onStarted` once the session is running, but the
            // VideoOutput's connection may still be in flight for ~hundreds of ms after.
            // Tolerate up to ~5s of attach latency before giving up.
            let recorder: Awaited<ReturnType<typeof videoOutput.createRecorder>> | null = null
            const maxAttempts = 20
            const attemptDelayMs = 250
            let lastErr: unknown = null
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                if (!mountedRef.current) {
                    startInProgressRef.current = false
                    return
                }
                try {
                    recorder = await videoOutput.createRecorder({})
                    break
                } catch (e) {
                    lastErr = e
                    const msg = e instanceof Error ? e.message : String(e)
                    if (!msg.includes("VideoOutput is not yet connected")) {
                        throw e
                    }
                    await new Promise((r) => setTimeout(r, attemptDelayMs))
                }
            }
            if (recorder == null) {
                throw lastErr ?? new Error("createRecorder failed after retries")
            }
            if (!mountedRef.current) {
                recorder.cancelRecording().catch(() => {})
                startInProgressRef.current = false
                return
            }
            recorderRef.current = recorder
            isRecording.current = true
            recordingStartedAtRef.current = Date.now()

            props.onRecordingStart?.()
            safeSetPressing(true)

            if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current)
            autoStopTimeoutRef.current = setTimeout(() => {
                if (isRecording.current) stopRecording()
            }, 30000)

            // If user already released while createRecorder was in flight, honor
            // the release now. stopRecording itself enforces MIN_RECORDING_MS so
            // the resulting clip won't be zero-length.
            if (releasePendingRef.current) {
                releasePendingRef.current = false
                stopRecording()
            }

            await recorder.startRecording(
                (filePath /*, reason */) => {
                    if (!mountedRef.current) return
                    const durationSec = Math.max(
                        0,
                        (Date.now() - recordingStartedAtRef.current) / 1000,
                    )
                    onMediaCaptured(filePath, durationSec)
                    onStoppedRecording()
                },
                (error) => {
                    // vision-camera v5 routes successful stops (-11818 with
                    // AVErrorRecordingSuccessfullyFinishedKey=true) through the error
                    // callback instead of the finished one. Treat that as success:
                    // pull the filePath from the recorder and deliver it normally.
                    const msg = (error as Error)?.message ?? String(error)
                    const isSuccessfulFinish =
                        msg.includes("AVErrorRecordingSuccessfullyFinishedKey=true") ||
                        msg.includes("Code=-11818")
                    if (isSuccessfulFinish) {
                        const path = (recorderRef.current as any)?.filePath as
                            | string
                            | undefined
                        if (path && mountedRef.current) {
                            const durationSec = Math.max(
                                0,
                                (Date.now() - recordingStartedAtRef.current) / 1000,
                            )
                            onMediaCaptured(path, durationSec)
                        }
                    } else {
                        console.error("Recording error:", error)
                    }
                    onStoppedRecording()
                },
            )
        } catch (e) {
            console.error("Failed to start recording:", e)
            onStoppedRecording()
        } finally {
            setTimeout(() => {
                startInProgressRef.current = false
            }, START_DEBOUNCE_MS)
        }
    }, [
        videoOutput,
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
                    holdTimerRef.current = setTimeout(() => {
                        startRecording().catch(() => {})
                    }, START_RECORDING_DELAY)
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
                    } else if (startInProgressRef.current) {
                        // User released while createRecorder/startRecording is still in
                        // flight. Mark the release as pending; startRecording will honor
                        // it (with MIN_RECORDING_MS enforced) once the recorder activates.
                        releasePendingRef.current = true
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
            runOnJS(handleReleaseFromPan)()
        })

    const shadowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isPressingButton.value ? 1 : 0) }],
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
    flex: { flex: 1 },
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
