import sizes from "@/constants/sizes"
import { useIsFocused, Stack, useRouter, useSegments } from "expo-router"
import * as React from "react"
import { useCallback, useEffect, useRef } from "react"
import type { GestureResponderEvent, ViewStyle } from "react-native"
import { StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { Extrapolate, interpolate, useSharedValue } from "react-native-reanimated"
import type { CameraRef } from "react-native-vision-camera"
import {
    Camera,
    CommonResolutions,
    useCameraDevice,
    useCameraPermission,
    useMicrophonePermission,
    useVideoOutput,
} from "react-native-vision-camera"
import { CaptureButton } from "../components/CaptureButton"
import CameraVideoSlider from "../components/CameraVideoSlider"
import { CONTENT_SPACING, MAX_ZOOM_FACTOR } from "../constants"
import { useIsForeground } from "../hooks/useIsForeground"
import { useCameraContext } from "../context"
import LanguageContext from "@/contexts/language"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import { FlashButton } from "../components/flashButton"
import { RotateButton } from "../components/rotateButton"
import { CameraPermissionNotProvidedCard } from "../components/CameraPermissionNotProvidedCard"
import { MicPermissionNotProvidedCard } from "../components/MicPermissionNotProvidedCard"

const SCALE_FULL_ZOOM = 3
const MAX_RECORDING_TIME = 30

export function CameraPage(): React.ReactElement {
    const router = useRouter()
    const camera = useRef<CameraRef>(null)

    const zoom = useSharedValue(1)
    const isPressingButton = useSharedValue(false)
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const insets = useSafeAreaInsets()
    // Audio is configured statically on the video output based on permission only.
    // We intentionally do NOT toggle it on capture-button press, because recreating
    // useVideoOutput mid-session triggers a configure() race that fails with
    // "cannot be added to Camera Session" (see vision-camera issue #3773).

    const {
        isRecording,
        setIsRecording,
        setVideo,
        setRecordingTime,
        setVideoBuffer,
        setTabHide,
        isCameraInitialized,
        setIsCameraInitialized,
        cameraPosition,
        torch,
        preferredDevice,
        microphonePermission,
    } = useCameraContext()
    const { t } = React.useContext(LanguageContext)
    const cameraPermission = useCameraPermission()
    const segments = useSegments()
    const isCreateTabActive = segments.includes("create")

    const isFocussed = useIsFocused()
    const isForeground = useIsForeground()
    const isActive = isFocussed && isForeground

    React.useEffect(() => {
        if (!isActive) return
        if (!isCreateTabActive) return

        let cancelled = false
        ;(async () => {
            try {
                if (!cameraPermission.hasPermission && cameraPermission.canRequestPermission) {
                    await cameraPermission.requestPermission()
                }
                if (
                    !microphonePermission.hasPermission &&
                    microphonePermission.canRequestPermission
                ) {
                    await microphonePermission.requestPermission()
                }
            } catch {
                /* noop */
            }
            if (cancelled) return
        })()

        return () => {
            cancelled = true
        }
    }, [isCreateTabActive, isActive])

    // Simple device selection — matches the official VisionCamera example.
    // iOS picks the best device for the position; multi-cam devices (LiDAR, triple-cam)
    // are handled by AVFoundation internally.
    const autoDevice = useCameraDevice(cameraPosition)
    const device =
        preferredDevice != null && preferredDevice.position === cameraPosition
            ? preferredDevice
            : autoDevice

    React.useEffect(() => {
        if (__DEV__ && device) {
            console.log(`[Camera] Selected: ${device.name} (type=${device.type})`)
        }
    }, [device])

    // Video output. DO NOT add a previewOutput here — the <Camera> component creates
    // and manages its own preview output internally (see vision-camera/src/views/Camera.tsx
    // line 167-172). Passing our own previewOutput would create a duplicate that gets
    // wired up but never receives frames (the internal one is the one tied to PreviewView).
    //
    // DEBUG: enableAudio: false to isolate recording flow. The -16418/-16414 errors
    // (kAudioCodecUnspecifiedError / kAudioFormatUnsupportedDataFormatError) happen
    // when AVAssetWriter is configured to write audio but samples don't flow.
    // Once video-only recording is confirmed working, re-enable audio.
    //
    // CRITICAL: use CommonResolutions.FHD_16_9 (constant reference) rather than
    // an inline { width, height } literal. useVideoOutput puts targetResolution in
    // its useMemo deps with Object.is comparison — a fresh literal each render
    // recreates videoOutput → outputs prop changes → session reconfigures in a
    // loop, spamming onSessionConfigSelected.
    const videoOutput = useVideoOutput({
        targetResolution: CommonResolutions.FHD_16_9,
        enableAudio: false,
    })

    // Memoize the outputs array so the session isn't reconfigured every render.
    const outputs = React.useMemo(() => [videoOutput], [videoOutput])

    const minZoom = device?.minZoom ?? 1
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR)

    const setIsPressingButton = useCallback(
        (_isPressingButton: boolean) => {
            isPressingButton.value = _isPressingButton
        },
        [isPressingButton],
    )

    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error)
    }, [])

    const onStarted = useCallback(() => {
        console.log("Camera started!")
    }, [])

    // True once the session has resolved its configuration AND attached outputs.
    // Capture button gates on this — `onStarted` alone fires before output connections
    // settle, which causes "VideoOutput is not yet connected" race on early record taps.
    const onSessionConfigSelected = useCallback(() => {
        console.log("Camera session config selected — ready to record")
        setIsCameraInitialized(true)
    }, [setIsCameraInitialized])

    const onMediaCaptured = useCallback(
        async (filePath: string, duration: number) => {
            console.log("📹 Media captured. Path:", filePath, "Duration:", duration)
            setIsRecording(false)
            setRecordingTime(0)
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current)
                recordingIntervalRef.current = null
            }

            const mimeType = "video/mp4"
            const fileUri = filePath.startsWith("file://") ? filePath : `file://${filePath}`

            setVideo({
                path: fileUri,
                duration,
                size: 0,
                mimeType,
                width: 0,
                height: 0,
            })

            router.push({
                pathname: "/(tabs)/create/media",
                params: {
                    videoUri: fileUri,
                    duration: duration?.toString(),
                },
            })
        },
        [router, setIsRecording, setVideo, setRecordingTime, setVideoBuffer],
    )

    const onFocusTap = useCallback(
        async ({ nativeEvent: event }: GestureResponderEvent) => {
            if (!device?.supportsFocus) return
            try {
                await camera.current?.focusTo({
                    x: event.locationX,
                    y: event.locationY,
                })
            } catch (e) {
                // Camera may not be ready yet; ignore.
            }
        },
        [device?.supportsFocus],
    )

    useEffect(() => {
        zoom.value = device?.neutralZoom ?? 1
    }, [zoom, device])

    React.useEffect(() => {
        setTabHide(false)
    }, [])

    useEffect(() => {
        if (isRecording) {
            if (!recordingIntervalRef.current) {
                setRecordingTime(0)
            }
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
            let current = 0
            recordingIntervalRef.current = setInterval(() => {
                current = current + 0.1
                if (current > MAX_RECORDING_TIME) current = MAX_RECORDING_TIME
                setRecordingTime(current)
                if (current >= MAX_RECORDING_TIME) {
                    setIsRecording(false)
                }
            }, 100)
        } else {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current)
                recordingIntervalRef.current = null
            }
            setRecordingTime(0)
        }
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current)
                recordingIntervalRef.current = null
            }
        }
    }, [isRecording, setRecordingTime, setIsRecording])

    const startZoomRef = useSharedValue(0)

    const pinchGesture = Gesture.Pinch()
        .onBegin(() => {
            "worklet"
            startZoomRef.value = zoom.value
        })
        .onUpdate((event) => {
            "worklet"
            if (isPressingButton.value) return
            const startZoom = startZoomRef.value
            const scale = interpolate(
                event.scale,
                [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
                [-1, 0, 1],
                Extrapolate.CLAMP,
            )
            zoom.value = interpolate(
                scale,
                [-1, 0, 1],
                [minZoom, startZoom, maxZoom],
                Extrapolate.CLAMP,
            )
        })

    const cameraStyle: ViewStyle = {
        width: sizes.moment.full.width,
        height: sizes.moment.full.height,
        backgroundColor: "black",
        borderRadius: 40,
        overflow: "hidden",
        alignSelf: "center",
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: isRecording ? t("Recording") : t("New Moment"),
                    headerTitleStyle: {
                        color: colors.gray.white,
                        fontFamily: fonts.family["Black-Italic"],
                    },
                }}
            />
            {!cameraPermission.hasPermission && <CameraPermissionNotProvidedCard />}
            {!microphonePermission.hasPermission &&
                cameraPermission.hasPermission &&
                !isRecording && (
                    <View
                        style={{
                            position: "absolute",
                            top: sizes.paddings["2sm"],
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1,
                        }}
                    >
                        <MicPermissionNotProvidedCard />
                    </View>
                )}
            <View style={styles.container}>
                {cameraPermission.hasPermission && device != null ? (
                    <GestureDetector gesture={pinchGesture}>
                        <View onTouchEnd={onFocusTap} style={cameraStyle} collapsable={false}>
                            <Camera
                                ref={camera}
                                style={{ flex: 1 }}
                                device={device}
                                isActive={isActive}
                                outputs={outputs}
                                zoom={zoom}
                                torchMode={torch}
                                onStarted={onStarted}
                                onStopped={() => console.log("[Camera] session stopped")}
                                onPreviewStarted={() => console.log("[Camera] PREVIEW started!")}
                                onPreviewStopped={() => console.log("[Camera] PREVIEW stopped")}
                                onSessionConfigSelected={onSessionConfigSelected}
                                onError={onError}
                            />
                        </View>
                    </GestureDetector>
                ) : null}

                {cameraPermission.hasPermission && (
                    <>
                        <View
                            style={[
                                styles.bottomBar,
                                { bottom: CONTENT_SPACING * 7 + insets.bottom },
                            ]}
                        >
                            <RotateButton />
                            <CaptureButton
                                style={styles.captureButton}
                                videoOutput={videoOutput}
                                cameraZoom={zoom}
                                minZoom={minZoom}
                                maxZoom={maxZoom}
                                enabled={isCameraInitialized && isActive}
                                setIsPressingButton={setIsPressingButton}
                                onRecordingStart={() => setIsRecording(true)}
                                onRecordingStop={() => setIsRecording(false)}
                                onMediaCaptured={onMediaCaptured}
                            />
                            <FlashButton />
                        </View>
                        {isRecording && (
                            <View
                                style={{
                                    position: "absolute",
                                    bottom: CONTENT_SPACING * 7.8 + insets.bottom,
                                }}
                            >
                                <CameraVideoSlider
                                    maxTime={MAX_RECORDING_TIME}
                                    width={sizes.moment.full.width * 0.6}
                                />
                            </View>
                        )}
                    </>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    captureButton: {
        width: 80,
        height: 80,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 24,
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        bottom: CONTENT_SPACING,
        left: 0,
        right: 0,
        zIndex: 10,
    },
})
