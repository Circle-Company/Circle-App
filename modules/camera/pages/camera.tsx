import sizes from "@/constants/sizes"
import { useIsFocused } from "@react-navigation/core"
import { Stack, useRouter, useSegments } from "expo-router"
import * as React from "react"
import { useCallback, useEffect, useRef } from "react"
import type { GestureResponderEvent, ViewStyle } from "react-native"
import { StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Reanimated, {
    Extrapolate,
    interpolate,
    useAnimatedProps,
    useSharedValue,
} from "react-native-reanimated"
import type { CameraProps, CameraRuntimeError, VideoFile } from "react-native-vision-camera"
import {
    Camera,
    useCameraDevice,
    useCameraFormat,
    useCameraPermission,
    useMicrophonePermission,
} from "react-native-vision-camera"
import { CaptureButton } from "../components/CaptureButton"
import CameraVideoSlider from "../components/CameraVideoSlider"
import { CONTENT_SPACING, MAX_ZOOM_FACTOR, SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants"
import { useIsForeground } from "../hooks/useIsForeground"
import { useCameraContext } from "../context"
import LanguageContext from "@/contexts/language"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import { FlashButton } from "../components/flashButton"
import { RotateButton } from "../components/rotateButton"
import { CameraPermissionNotProvidedCard } from "../components/CameraPermissionNotProvidedCard"
import { MicPermissionNotProvidedCard } from "../components/MicPermissionNotProvidedCard"

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
    zoom: true,
})

const SCALE_FULL_ZOOM = 3
const MAX_RECORDING_TIME = 30 // segundos
const TARGET_FPS = 60

export function CameraPage(): React.ReactElement {
    const router = useRouter()
    const camera: any = useRef<Camera>(null)

    const zoom = useSharedValue(1)
    const isPressingButton = useSharedValue(false)
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const insets = useSafeAreaInsets()
    const [shouldEnableAudio, setShouldEnableAudio] = React.useState(false)

    // Camera context
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
        locationPermission,
    } = useCameraContext()
    const { t } = React.useContext(LanguageContext)
    const cameraPermission = useCameraPermission()
    const segments = useSegments()
    const isCreateTabActive = segments.includes("create")
    // using useSegments() to detect active create tab; no pathname needed

    // check if camera page is active
    const isFocussed = useIsFocused()
    const isForeground = useIsForeground()
    const isActive = isFocussed && isForeground

    // Request camera and microphone permissions only when this CameraPage is active
    // and we are on the /(tabs)/create route, and only if their status is undetermined.
    React.useEffect(() => {
        if (!isActive) return
        if (!isCreateTabActive) return

        let cancelled = false
        ;(async () => {
            try {
                const camStatus = Camera.getCameraPermissionStatus()
                const micStatus = Camera.getMicrophonePermissionStatus()
                if (cancelled) return

                if (camStatus === "not-determined") {
                    await cameraPermission.requestPermission?.()
                }
                if (micStatus === "not-determined") {
                    await microphonePermission.requestPermission?.()
                }
            } catch {
                // no-op
            }
        })()

        return () => {
            cancelled = true
        }
    }, [isCreateTabActive, isActive])
    // camera device settings

    let device = useCameraDevice(cameraPosition)

    if (preferredDevice != null && preferredDevice.position === cameraPosition) {
        // override default device with the one selected by the user in settings
        device = preferredDevice
    }

    const screenAspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH
    const format = useCameraFormat(device, [
        { fps: TARGET_FPS },
        { videoAspectRatio: screenAspectRatio },
        { videoResolution: { width: sizes.moment.full.width, height: sizes.moment.full.height } }, // Limita gravação ao tamanho do container da câmera
    ])

    const fps = Math.min(format?.maxFps ?? 1, TARGET_FPS)

    //#region Animated Zoom
    const minZoom = device?.minZoom ?? 1
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR)

    const cameraAnimatedProps = useAnimatedProps<CameraProps>(() => {
        const z = Math.max(Math.min(zoom.value, maxZoom), minZoom)
        return {
            zoom: z,
        }
    }, [maxZoom, minZoom, zoom])

    //#endregion

    //#region Callbacks
    const setIsPressingButton = useCallback(
        (_isPressingButton: boolean) => {
            isPressingButton.value = _isPressingButton
            if (_isPressingButton) {
                setShouldEnableAudio(true)
            } else if (!isRecording) {
                setShouldEnableAudio(false)
            }
        },
        [isPressingButton, isRecording],
    )
    const onError = useCallback((error: CameraRuntimeError) => {
        console.error(error)
    }, [])
    const onInitialized = useCallback(() => {
        console.log("Camera initialized!")
        setIsCameraInitialized(true)
    }, [])
    const onMediaCaptured = useCallback(
        async (media: VideoFile, type: "video") => {
            console.log(`Media captured! ${JSON.stringify(media)}`)
            console.log("📹 Original path:", media.path)

            // Finaliza estado de gravação e timer
            setIsRecording(false)
            setRecordingTime(0)
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current)
                recordingIntervalRef.current = null
            }

            // Usa o caminho original do vídeo e apenas garante o prefixo file://
            const mimeType = "video/mp4"
            let fileUri = media.path || ""
            if (fileUri && !fileUri.startsWith("file://")) {
                fileUri = `file://${fileUri}`
            }

            // Tenta inferir tamanho com a API nova no futuro; por ora mantemos 0
            const fileSize = 0

            console.log("📹 URI final para exibição:", fileUri)

            // Salvar dados no contexto
            setVideo({
                path: fileUri,
                duration: media.duration,
                size: fileSize,
                mimeType: mimeType,
                width: media.width,
                height: media.height,
            })

            // Navegar passando o fileUri diretamente como parâmetro
            router.push({
                pathname: "/(tabs)/create/media",
                params: {
                    videoUri: fileUri,
                    duration: media.duration?.toString(),
                    width: media.width?.toString(),
                    height: media.height?.toString(),
                },
            })
            // zoom.value = minZoom
        },
        [router, setIsRecording, setVideo, setRecordingTime, setVideoBuffer],
    )

    //#endregion

    //#region Tap Gesture
    const onFocusTap = useCallback(
        ({ nativeEvent: event }: GestureResponderEvent) => {
            if (!device?.supportsFocus) return
            camera.current?.focus({
                x: event.locationX,
                y: event.locationY,
            })
        },
        [device?.supportsFocus],
    )

    //#region Effects
    useEffect(() => {
        // Reset zoom to it's default everytime the `device` changes.
        zoom.value = device?.neutralZoom ?? 1
    }, [zoom, device])
    //#endregion

    React.useEffect(() => {
        setTabHide(false)
    }, [])

    // Timer para gravação§
    useEffect(() => {
        if (isRecording) {
            // Só reseta o tempo se não estiver gravando ainda
            if (!recordingIntervalRef.current) {
                setRecordingTime(0)
            }
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
            let current = 0
            recordingIntervalRef.current = setInterval(() => {
                current = current + 0.1
                if (current > MAX_RECORDING_TIME) {
                    current = MAX_RECORDING_TIME
                }
                setRecordingTime(current)
                if (current >= MAX_RECORDING_TIME) {
                    setIsRecording(false)
                    if (camera.current) {
                        camera.current.stopRecording()
                    }
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
    }, [isRecording, camera, setRecordingTime, setIsRecording, MAX_RECORDING_TIME])

    // Disable audio input when not recording or when screen is inactive
    useEffect(() => {
        if (!isRecording) {
            setShouldEnableAudio(false)
        }
    }, [isRecording])

    useEffect(() => {
        if (!isActive) {
            setShouldEnableAudio(false)
        }
    }, [isActive])

    //#region Pinch to Zoom Gesture
    // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
    // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
    const startZoomRef = useSharedValue(0)

    const pinchGesture = Gesture.Pinch()
        .onBegin(() => {
            "worklet"
            startZoomRef.value = zoom.value
        })
        .onUpdate((event) => {
            "worklet"
            // block pinch-to-zoom while the capture button is pressed
            if (isPressingButton.value) {
                return
            }
            // we're trying to map the scale gesture to a linear zoom here
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
    //#endregion

    useEffect(() => {
        const f =
            format != null
                ? `(${format.videoWidth}x${format.videoHeight}@${format.maxFps} video @ ${fps}fps)`
                : undefined
        console.log(`Camera: ${device?.name} | Format: ${f}`)
    }, [device?.name, format, fps])

    const cameraStyle: ViewStyle = {
        width: sizes.moment.full.width,
        height: sizes.moment.full.height,
        backgroundColor: "black",
        borderRadius: 40,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
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
                {cameraPermission.hasPermission ? (
                    device != null ? (
                        <GestureDetector gesture={pinchGesture}>
                            <Reanimated.View
                                onTouchEnd={onFocusTap}
                                style={[
                                    {
                                        alignItems: "center",
                                        justifyContent: "center",
                                        alignSelf: "center",
                                        borderRadius: 40,
                                        overflow: "hidden",
                                    },
                                ]}
                            >
                                <View style={cameraStyle}>
                                    <ReanimatedCamera
                                        style={StyleSheet.absoluteFillObject}
                                        device={device}
                                        isActive={isActive}
                                        ref={camera}
                                        onInitialized={onInitialized}
                                        onError={onError}
                                        format={format}
                                        fps={fps}
                                        lowLightBoost={false}
                                        enableZoomGesture={false}
                                        animatedProps={cameraAnimatedProps}
                                        exposure={0}
                                        outputOrientation="device"
                                        photo={false}
                                        video={true}
                                        audio={microphonePermission.hasPermission}
                                        enableLocation={locationPermission.hasPermission}
                                        torch={torch}
                                    />
                                </View>
                            </Reanimated.View>
                        </GestureDetector>
                    ) : null
                ) : null}

                {cameraPermission.hasPermission && (
                    <>
                        <View
                            style={[
                                styles.bottomBar,
                                { bottom: CONTENT_SPACING * 9 + insets.bottom },
                            ]}
                        >
                            <RotateButton />
                            <CaptureButton
                                style={styles.captureButton}
                                camera={camera}
                                onMediaCaptured={onMediaCaptured as any}
                                cameraZoom={zoom}
                                minZoom={minZoom}
                                maxZoom={maxZoom}
                                flash="off"
                                enabled={isCameraInitialized && isActive}
                                setIsPressingButton={setIsPressingButton}
                                onRecordingStart={() => setIsRecording(true)}
                                onRecordingStop={() => setIsRecording(false)}
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
    sideButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(140, 140, 140, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 8,
    },
    sideButtonTorchOn: {
        backgroundColor: colors.yellow.yellow_09 + 90,
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
    text: {
        color: "white",
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})
