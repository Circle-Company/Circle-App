import sizes from "@/constants/sizes"
import { useIsFocused } from "@react-navigation/core"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import type { GestureResponderEvent, ViewStyle } from "react-native"
import { StyleSheet, Text, View } from "react-native"
import RotateIcon from "@/assets/icons/svgs/arrow.triangle.2.circlepath.svg"
import FlashOnIcon from "@/assets/icons/svgs/flashlight.on.fill.svg"
import FlashOffIcon from "@/assets/icons/svgs/flashlight.off.fill.svg"
import { Gesture, GestureDetector, TapGestureHandler } from "react-native-gesture-handler"
import { PressableOpacity } from "react-native-pressable-opacity"
import Reanimated, {
    Extrapolate,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated"
import type { CameraProps, CameraRuntimeError, VideoFile } from "react-native-vision-camera"
import {
    Camera,
    useCameraDevice,
    useCameraFormat,
    useLocationPermission,
    useMicrophonePermission,
} from "react-native-vision-camera"
import { CaptureButton } from "../components/CaptureButton"
import CameraVideoSlider from "../components/CameraVideoSlider"
import { CONTENT_SPACING, MAX_ZOOM_FACTOR, SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants"
import { useIsForeground } from "../hooks/useIsForeground"
import { usePreferredCameraDevice } from "../hooks/usePreferredCameraDevice"
import type { Routes } from "../routes"
import { useCameraContext } from "../context"
import LanguageContext from "@/contexts/Preferences/language"
import { colors } from "@/constants/colors"

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
    zoom: true,
})

const SCALE_FULL_ZOOM = 3
const MAX_RECORDING_TIME = 30 // segundos
const TARGET_FPS = 60

type Props = NativeStackScreenProps<Routes, "CameraPage">
export function CameraPage({ navigation }: Props): React.ReactElement {
    const camera: any = useRef<Camera>(null)
    const [isCameraInitialized, setIsCameraInitialized] = useState(false)
    const microphone = useMicrophonePermission()
    const location = useLocationPermission()
    const zoom = useSharedValue(1)
    const isPressingButton = useSharedValue(false)
    const rotateAnimation = useSharedValue(0)
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Camera context
    const { isRecording, setIsRecording, setVideo, setRecordingTime, setVideoBuffer } =
        useCameraContext()
    const { t } = React.useContext(LanguageContext)

    React.useEffect(() => {
        navigation.setOptions({
            headerTitle: isRecording ? t("Recording") : t("New Moment"),
        })
    }, [isRecording, t, navigation])

    // check if camera page is active
    const isFocussed = useIsFocused()
    const isForeground = useIsForeground()
    const isActive = isFocussed && isForeground
    const [cameraPosition, setCameraPosition] = useState<"front" | "back">("back")
    const [torch, setTorch] = useState<"off" | "on">("off")

    // camera device settings
    const [preferredDevice] = usePreferredCameraDevice()
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

    const rotateIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotateAnimation.value}deg` }],
        }
    }, [rotateAnimation])
    //#endregion

    //#region Callbacks
    const setIsPressingButton = useCallback(
        (_isPressingButton: boolean) => {
            isPressingButton.value = _isPressingButton
        },
        [isPressingButton],
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
            setIsRecording(false)
            setRecordingTime(0)
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current)
                recordingIntervalRef.current = null
            }

            // Caminho do vídeo capturado temporário
            const tempPath = media.path

            // Obter tamanho do arquivo
            let fileSize = 0
            const mimeType = "video/mp4" // Sempre MP4 agora

            try {
                const stat = await RNFS.stat(tempPath)
                fileSize = stat.size
                console.log("📊 Tamanho do arquivo:", fileSize, "bytes")
            } catch (error) {
                console.error("❌ Erro ao obter informações do arquivo:", error)
            }

            // Criar diretório temp se não existir
            const tempDir = `${RNFS.DocumentDirectoryPath}/temp`

            console.log("📁 Document directory:", RNFS.DocumentDirectoryPath)
            console.log("📁 Temp directory:", tempDir)

            try {
                const dirExists = await RNFS.exists(tempDir)
                if (!dirExists) {
                    console.log("📁 Criando diretório temp...")
                    await RNFS.mkdir(tempDir)
                    console.log("✅ Diretório criado com sucesso!")
                }
            } catch (error) {
                console.error("❌ Erro ao criar diretório temp:", error)
            }

            // Copiar vídeo para pasta temp com nome único
            const timestamp = Date.now()
            const fileName = `video_${timestamp}.mp4`
            const finalPath = `${tempDir}/${fileName}`

            console.log("📂 Copiando vídeo de:", tempPath)
            console.log("📂 Para:", finalPath)

            try {
                await RNFS.copyFile(tempPath, finalPath)
                console.log("✅ Vídeo copiado com sucesso!")

                // Verificar se arquivo foi copiado
                const copiedStat = await RNFS.stat(finalPath)
                fileSize = copiedStat.size
                console.log("✅ Arquivo verificado, tamanho:", fileSize, "bytes")
            } catch (error) {
                console.error("❌ Erro ao copiar vídeo:", error)
                console.error("❌ Detalhes do erro:", JSON.stringify(error))
            }

            console.log("📹 Arquivo de vídeo salvo:", {
                path: finalPath,
                duration: media.duration,
                size: fileSize,
                mimeType: mimeType,
                width: media.width,
                height: media.height,
            })

            // Adicionar prefixo file:// ao path final se necessário
            // FileSystem.documentDirectory pode já incluir file://
            let fileUri = finalPath
            if (!fileUri.startsWith("file://")) {
                fileUri = `file://${fileUri}`
            }

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
            navigation.navigate("MediaPage", {
                videoUri: fileUri,
                duration: media.duration,
                width: media.width,
                height: media.height,
            })
        },
        [navigation, setIsRecording, setVideo, setRecordingTime, setVideoBuffer],
    )
    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === "back" ? "front" : "back"))
        rotateAnimation.value = withSpring(rotateAnimation.value + 180, {
            damping: 15,
            stiffness: 150,
        })
    }, [rotateAnimation])

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
    const onDoubleTap = useCallback(() => {
        onFlipCameraPressed()
    }, [onFlipCameraPressed])
    //#endregion

    //#region Effects
    useEffect(() => {
        // Reset zoom to it's default everytime the `device` changes.
        zoom.value = device?.neutralZoom ?? 1
    }, [zoom, device])
    //#endregion

    // Timer para gravação
    useEffect(() => {
        if (isRecording) {
            // Só reseta o tempo se não estiver gravando ainda
            if (!recordingIntervalRef.current) {
                setRecordingTime(0)
            }
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev + 0.1 >= MAX_RECORDING_TIME) {
                        setIsRecording(false)
                        if (camera.current) {
                            camera.current.stopRecording()
                        }
                        return MAX_RECORDING_TIME
                    }
                    return prev + 0.1
                })
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

    useEffect(() => {
        location.requestPermission()
    }, [location])

    const cameraStyle: ViewStyle = {
        width: sizes.moment.full.width,
        height: sizes.moment.full.height,
        backgroundColor: "black",
        borderRadius: 25,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        position: "relative",
    }

    return (
        <View style={styles.container}>
            {device != null ? (
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
                        <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
                            <ReanimatedCamera
                                style={cameraStyle}
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
                                video={true}
                                audio={microphone.hasPermission}
                                enableLocation={location.hasPermission}
                                torch={torch}
                            />
                        </TapGestureHandler>
                    </Reanimated.View>
                </GestureDetector>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.text}>Your phone does not have a Camera.</Text>
                </View>
            )}

            {isRecording && (
                <View>
                    <CameraVideoSlider
                        maxTime={MAX_RECORDING_TIME}
                        width={sizes.moment.full.width}
                    />
                </View>
            )}

            <View style={styles.bottomBar}>
                <PressableOpacity
                    style={styles.sideButton}
                    onPress={onFlipCameraPressed}
                    disabledOpacity={0.4}
                >
                    <Reanimated.View style={rotateIconStyle}>
                        <RotateIcon fill={colors.gray.white} width={22} height={22} />
                    </Reanimated.View>
                </PressableOpacity>

                <CaptureButton
                    style={styles.captureButton}
                    camera={camera}
                    onMediaCaptured={onMediaCaptured}
                    cameraZoom={zoom}
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    flash="off"
                    enabled={isCameraInitialized && isActive}
                    setIsPressingButton={setIsPressingButton}
                    onRecordingStart={() => setIsRecording(true)}
                    onRecordingStop={() => setIsRecording(false)}
                />

                <PressableOpacity
                    style={[
                        styles.sideButton,
                        torch === "on" && styles.sideButtonTorchOn,
                        cameraPosition === "front" && { opacity: 0.4 },
                    ]}
                    onPress={() => {
                        if (cameraPosition !== "front") {
                            setTorch((t) => (t === "off" ? "on" : "off"))
                        }
                    }}
                    disabledOpacity={0.4}
                    disabled={cameraPosition === "front"}
                >
                    {torch === "on" ? (
                        <FlashOnIcon
                            fill={cameraPosition === "front" ? "#888" : "white"}
                            width={22}
                            height={22}
                        />
                    ) : (
                        <FlashOffIcon
                            fill={cameraPosition === "front" ? "#888" : "white"}
                            width={22}
                            height={22}
                        />
                    )}
                </PressableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
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
        bottom: CONTENT_SPACING * 3,
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
