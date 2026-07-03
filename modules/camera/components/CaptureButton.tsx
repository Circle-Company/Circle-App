import ColorTheme from "@/constants/colors"
import React from "react"
import type { ViewProps } from "react-native"
import { StyleSheet, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Reanimated, {
    cancelAnimation,
    Easing,
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import type { SharedValue } from "react-native-reanimated"
import type { CameraVideoOutput, Recorder } from "react-native-vision-camera"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { CAPTURE_BUTTON_SIZE, SCREEN_HEIGHT } from "../constants"

// Video-only capture: press starts recording immediately (no delay/long-press).
const START_RECORDING_DELAY = 0
const START_DEBOUNCE_MS = 120
const STOP_DEBOUNCE_MS = 120
// Minimum hold time before allowing stop. Prevents accidental sub-second clips
// from the async createRecorder/startRecording chain finishing right as the user
// releases — gives AVAssetWriter enough samples to finalize a valid file.
const MIN_RECORDING_MS = 600
// Horizontal drag distance (in px) past which the camera flips during a hold.
// FLIP_THRESHOLD_PX is the "trip" point going left from the origin; once
// flipped, the finger has to come back past FLIP_RETURN_PX (closer to the
// origin) to flip back. The gap between the two values is hysteresis — keeps
// minor finger jitter near the threshold from seesawing the camera.
const FLIP_THRESHOLD_PX = 80
const FLIP_RETURN_PX = 24
// Flip is only armed after the finger has been (nearly) still for this long
// following press-down. A diagonal drag from the moment of press (e.g. user
// pinches up-and-left to zoom) never dwells, so flip stays disabled for the
// whole gesture — the user has to release, re-press, hold still, then drag.
const FLIP_ARM_DWELL_MS = 350
// Max Euclidean drift (px) allowed during the dwell window. Anything above
// this and the arming attempt is permanently invalidated for this gesture.
// 30 gives fat-finger jitter enough room while still failing on a real drag.
const FLIP_ARM_DRIFT_TOLERANCE_PX = 30
// Forward flip also demands the drag be primarily horizontal at the moment
// it crosses the trigger threshold: |dx| must be at least this many times
// |dy|. 1.5 = up to ~33° off horizontal counts as "sideways". Stops a slow
// diagonal drag (which can pass the dwell check by not moving much early on)
// from firing the flip when the intent was clearly zoom-plus-side.
const FLIP_FORWARD_HORIZONTAL_DOMINANCE = 1.5
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
    /**
     * Called when the user drags horizontally past FLIP_THRESHOLD_PX while
     * holding the button. Used to toggle the camera (front ↔ back) without
     * interrupting an active recording.
     */
    onFlipCamera?: () => void
}

const CaptureButtonComponent: React.FC<Props> = ({
    videoOutput,
    onMediaCaptured,
    minZoom,
    maxZoom,
    cameraZoom,
    enabled,
    setIsPressingButton,
    onFlipCamera,
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

        const wasActuallyRecording = isRecording.current

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

        // Only buzz on the transition out of a real recording — onStoppedRecording
        // also runs as a cleanup path when startRecording fails before any frames
        // were captured, and we don't want to fake a "stop" haptic in that case.
        if (wasActuallyRecording) Vibrate("selection")

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

            // Light tap when the recorder actually engages (not on touch-down)
            // so the user feels the moment frames start being written, not the
            // moment they merely pressed.
            Vibrate("virtualKey")
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
                        const path = (recorderRef.current as any)?.filePath as string | undefined
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

    const handlePressDown = React.useCallback(() => {
        safeSetPressing(true)
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
        if (START_RECORDING_DELAY === 0) {
            startRecording().catch(() => {})
        } else {
            holdTimerRef.current = setTimeout(() => {
                startRecording().catch(() => {})
            }, START_RECORDING_DELAY)
        }
    }, [safeSetPressing, startRecording])

    const handlePressUp = React.useCallback(() => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current)
            holdTimerRef.current = null
        }
        if (isRecording.current) {
            stopRecording()
        } else if (startInProgressRef.current) {
            // User released while createRecorder/startRecording is still in flight.
            // Mark release as pending; startRecording honors it (with MIN_RECORDING_MS
            // enforced) once the recorder activates.
            releasePendingRef.current = true
        } else {
            safeSetPressing(false)
        }
    }, [safeSetPressing, stopRecording])

    const panStartY = useSharedValue(0)
    const panOffsetY = useSharedValue(0)
    // Detent state for the flip gesture. `flipped` reflects whether we are
    // currently OFFSET from the starting camera by one flip. Crossing
    // translationX past -FLIP_THRESHOLD_PX while not flipped sets it true
    // and fires onFlipCamera; sliding back toward the origin past
    // -FLIP_RETURN_PX sets it false and fires onFlipCamera again, returning
    // the camera to its original position. Reset to false on every new hold.
    const flipped = useSharedValue(false)
    // Dwell arming for the flip gesture. `panStartTime` marks when the pan
    // began; `maxEarlyDrift` tracks the biggest distance the finger has been
    // from that origin during the FLIP_ARM_DWELL_MS window. The flip is
    // eligible only when (elapsed >= dwell) AND (maxEarlyDrift < tolerance).
    // A diagonal zoom drag from press-down blows past the tolerance in the
    // first few frames, permanently disqualifying flip for that gesture —
    // exactly what we want to keep zoom and flip separate.
    const panStartTime = useSharedValue(0)
    const maxEarlyDrift = useSharedValue(0)

    // LongPress with minDuration(0) and maxDistance(Infinity) — fires onStart on
    // touch and stays active during finger movement. Composed with Pan via
    // Gesture.Simultaneous so the same touch drives both: LongPress detects the
    // hold lifecycle (start/end of recording) while Pan tracks vertical drag
    // for zoom. The legacy TapGestureHandler used to cancel on movement, killing
    // the recording the moment the user started dragging to zoom.
    const longPress = Gesture.LongPress()
        .enabled(enabled)
        .minDuration(0)
        .maxDistance(Number.MAX_SAFE_INTEGER)
        .shouldCancelWhenOutside(false)
        .onStart(() => {
            "worklet"
            runOnJS(handlePressDown)()
        })
        .onFinalize(() => {
            "worklet"
            runOnJS(handlePressUp)()
        })

    const pan = Gesture.Pan()
        .enabled(enabled)
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
            flipped.value = false
            panStartTime.value = Date.now()
            maxEarlyDrift.value = 0
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

            // Track the biggest drift during the arming window. Once the
            // window closes, this value is frozen for the rest of the gesture
            // and used to decide whether flip stays disabled.
            const elapsed = Date.now() - panStartTime.value
            if (elapsed < FLIP_ARM_DWELL_MS) {
                const drift = Math.sqrt(
                    event.translationX * event.translationX +
                        event.translationY * event.translationY,
                )
                if (drift > maxEarlyDrift.value) maxEarlyDrift.value = drift
            }

            if (onFlipCamera == null) return

            // Two-way flip detent, GATED on the arming check above.
            //   - Drag LEFT past -FLIP_THRESHOLD_PX  → first flip
            //   - Bring finger BACK past -FLIP_RETURN_PX → flip back to origin
            // FLIP_THRESHOLD_PX (80) and FLIP_RETURN_PX (24) bracket a dead
            // zone that absorbs finger jitter without re-firing the flip.
            //
            // Arming requires: (a) at least FLIP_ARM_DWELL_MS elapsed since
            // press-down AND (b) finger stayed within FLIP_ARM_DRIFT_TOLERANCE_PX
            // of the origin during that window. A diagonal drag from press
            // (zoom + horizontal) fails (b) immediately and never arms.
            const armed =
                elapsed >= FLIP_ARM_DWELL_MS && maxEarlyDrift.value < FLIP_ARM_DRIFT_TOLERANCE_PX
            if (!armed) return

            if (!flipped.value && event.translationX < -FLIP_THRESHOLD_PX) {
                // Second safety net: even when armed, only fire the forward
                // flip if the drag is horizontal-dominant right now. This
                // catches slow diagonal drags that manage to sneak past the
                // dwell check (finger barely moving during 350ms then
                // gradually building up an up-and-left path).
                const horizontalDominant =
                    Math.abs(event.translationX) >=
                    Math.abs(event.translationY) * FLIP_FORWARD_HORIZONTAL_DOMINANCE
                if (!horizontalDominant) return

                flipped.value = true
                runOnJS(onFlipCamera)()
            } else if (flipped.value && event.translationX > -FLIP_RETURN_PX) {
                // Back-flip intentionally skips the direction check — the
                // return path can curve upward as the finger relaxes, and
                // we don't want to strand the user on the flipped camera if
                // dy happens to be large at the moment dx crosses back.
                flipped.value = false
                runOnJS(onFlipCamera)()
            }
        })

    const composedGesture = Gesture.Simultaneous(longPress, pan)

    const shadowStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isPressingButton.value ? 1 : 0) }],
    }))

    // Tactile "physical button" animation: the button compresses down + sinks
    // into the surface + loses its drop-shadow when pressed. Press-in uses a
    // fast timing (feels like meeting a hard stop); release uses a springy
    // response so the button pops back with a small overshoot, the way a
    // real dome-switch button would.
    const buttonStyle = useAnimatedStyle(() => {
        if (!enabled) {
            return {
                opacity: withTiming(0.3),
                transform: [
                    { scale: withSpring(0.6) },
                    { translateY: withTiming(0) },
                ],
            }
        }
        const pressed = isPressingButton.value
        return {
            opacity: withTiming(1),
            transform: [
                {
                    scale: pressed
                        ? withTiming(1.15, {
                              duration: 90,
                              easing: Easing.out(Easing.quad),
                          })
                        : withSpring(1, {
                              damping: 12,
                              stiffness: 240,
                              mass: 0.55,
                          }),
                },
                {
                    // Sink slightly into the surface. Small value (3pt) —
                    // enough to read visually without disconnecting the
                    // capture button from the bottom bar.
                    translateY: pressed
                        ? withTiming(3, {
                              duration: 90,
                              easing: Easing.out(Easing.quad),
                          })
                        : withSpring(0, {
                              damping: 12,
                              stiffness: 300,
                              mass: 0.5,
                          }),
                },
            ],
        }
    })

    // Drop shadow that lives on the ring itself. Elevated at rest, nearly
    // flat when pressed. Reads as "the button is touching the surface now"
    // rather than "the button is floating above it".
    const ringShadowStyle = useAnimatedStyle(() => {
        if (!enabled) return { shadowOpacity: 0 }
        const pressed = isPressingButton.value
        return {
            shadowOpacity: withTiming(pressed ? 0.08 : 0.32, { duration: 120 }),
            shadowRadius: withTiming(pressed ? 3 : 10, { duration: 120 }),
        }
    })

    return (
        <GestureDetector gesture={composedGesture}>
            <Reanimated.View {...props} style={[buttonStyle, style]}>
                <Reanimated.View style={styles.flex}>
                    <Reanimated.View style={[styles.shadow, shadowStyle]} />
                    <Reanimated.View style={[styles.button, ringShadowStyle]} />
                </Reanimated.View>
            </Reanimated.View>
        </GestureDetector>
    )
}

export const CaptureButton = React.memo(CaptureButtonComponent)

const styles = StyleSheet.create({
    flex: { flex: 1 },
    // Recording indicator that sits inside the white ring. Only visible
    // while isPressingButton is true (shadowStyle scales it from 0 → 1),
    // so the resting borderRadius here is what the user actually sees:
    // a rounded square that reads as "stop" — the iOS-camera pattern for
    // an active recording state.
    shadow: {
        position: "absolute",
        margin: (CAPTURE_BUTTON_SIZE - CAPTURE_BUTTON_SIZE * 0.55) / 2,
        width: CAPTURE_BUTTON_SIZE * 0.55,
        height: CAPTURE_BUTTON_SIZE * 0.55,
        borderRadius: CAPTURE_BUTTON_SIZE * 0.12,
        backgroundColor: ColorTheme().primary,
    },
    button: {
        width: CAPTURE_BUTTON_SIZE,
        height: CAPTURE_BUTTON_SIZE,
        borderRadius: CAPTURE_BUTTON_SIZE / 2,
        borderWidth: BORDER_WIDTH,
        borderColor: "white",
        // Static shadow config that ringShadowStyle animates against. The
        // solid white border gives iOS enough opaque pixels to draw the
        // shadow around; a fully transparent ring wouldn't shadow anything.
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.32,
        shadowRadius: 10,
    },
})
