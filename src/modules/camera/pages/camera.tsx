import sizes from "@/constants/sizes"
import { Ionicons } from "@expo/vector-icons"
import { useIsFocused } from "@react-navigation/core"
import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import * as React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { GestureResponderEvent, ViewStyle } from "react-native"
import { StyleSheet, Text, View } from "react-native"
import type { PinchGestureHandlerGestureEvent } from "react-native-gesture-handler"
import { PinchGestureHandler, TapGestureHandler } from "react-native-gesture-handler"
import { PressableOpacity } from "react-native-pressable-opacity"
import Reanimated, {
    Extrapolate,
    interpolate,
    useAnimatedGestureHandler,
    useAnimatedProps,
    useSharedValue,
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
import { StatusBarBlurBackground } from "../components/StatusBarBlurBackground"
import {
    CONTENT_SPACING,
    CONTROL_BUTTON_SIZE,
    MAX_ZOOM_FACTOR,
    SAFE_AREA_PADDING,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from "../constants"
import { useIsForeground } from "../hooks/useIsForeground"
import { usePreferredCameraDevice } from "../hooks/usePreferredCameraDevice"
import type { Routes } from "../routes"

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
    zoom: true,
})

const SCALE_FULL_ZOOM = 3

type Props = NativeStackScreenProps<Routes, "CameraPage">
export function CameraPage({ navigation }: Props): React.ReactElement {
    const camera: any = useRef<Camera>(null)
    const [isCameraInitialized, setIsCameraInitialized] = useState(false)
    const microphone = useMicrophonePermission()
    const location = useLocationPermission()
    const zoom = useSharedValue(1)
    const isPressingButton = useSharedValue(false)

    // check if camera page is active
    const isFocussed = useIsFocused()
    const isForeground = useIsForeground()
    const isActive = isFocussed && isForeground

    const [cameraPosition, setCameraPosition] = useState<"front" | "back">("back")
    const [enableNightMode, setEnableNightMode] = useState(false)

    // camera device settings
    const [preferredDevice] = usePreferredCameraDevice()
    let device = useCameraDevice(cameraPosition)

    if (preferredDevice != null && preferredDevice.position === cameraPosition) {
        // override default device with the one selected by the user in settings
        device = preferredDevice
    }

    const [targetFps, setTargetFps] = useState(60)

    const screenAspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH
    const format = useCameraFormat(device, [
        { fps: targetFps },
        { videoAspectRatio: screenAspectRatio },
        { videoResolution: "max" },
    ])

    const fps = Math.min(format?.maxFps ?? 1, targetFps)

    const supports60Fps = useMemo(
        () => device?.formats.some((f) => f.maxFps >= 60),
        [device?.formats],
    )
    const canToggleNightMode = device?.supportsLowLightBoost ?? false

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
        (media: VideoFile, type: "video") => {
            console.log(`Media captured! ${JSON.stringify(media)}`)
            navigation.navigate("MediaPage", {
                path: media.path,
                type: type,
            })
        },
        [navigation],
    )
    const onFlipCameraPressed = useCallback(() => {
        setCameraPosition((p) => (p === "back" ? "front" : "back"))
    }, [])

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

    //#region Pinch to Zoom Gesture
    // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
    // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
    const onPinchGesture = useAnimatedGestureHandler<
        PinchGestureHandlerGestureEvent,
        { startZoom?: number }
    >({
        onStart: (_, context) => {
            context.startZoom = zoom.value
        },
        onActive: (event, context) => {
            // we're trying to map the scale gesture to a linear zoom here
            const startZoom = context.startZoom ?? 0
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
        },
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
    }

    return (
        <View style={styles.container}>
            {device != null ? (
                <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
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
                                onStarted={() => console.log("Camera started!")}
                                onStopped={() => console.log("Camera stopped!")}
                                onPreviewStarted={() => console.log("Preview started!")}
                                onPreviewStopped={() => console.log("Preview stopped!")}
                                onOutputOrientationChanged={(o) =>
                                    console.log(`Output orientation changed to ${o}!`)
                                }
                                onPreviewOrientationChanged={(o) =>
                                    console.log(`Preview orientation changed to ${o}!`)
                                }
                                onUIRotationChanged={(degrees) =>
                                    console.log(`UI Rotation changed: ${degrees}°`)
                                }
                                format={format}
                                fps={fps}
                                lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                                enableZoomGesture={false}
                                animatedProps={cameraAnimatedProps}
                                exposure={0}
                                outputOrientation="device"
                                video={true}
                                audio={microphone.hasPermission}
                                enableLocation={location.hasPermission}
                            />
                        </TapGestureHandler>
                    </Reanimated.View>
                </PinchGestureHandler>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.text}>Your phone does not have a Camera.</Text>
                </View>
            )}

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
            />

            <StatusBarBlurBackground />

            <View style={styles.rightButtonRow}>
                <PressableOpacity
                    style={styles.button}
                    onPress={onFlipCameraPressed}
                    disabledOpacity={0.4}
                >
                    <Ionicons name="camera-reverse" color="white" size={24} />
                </PressableOpacity>
                {supports60Fps && (
                    <PressableOpacity
                        style={styles.button}
                        onPress={() => setTargetFps((t) => (t === 30 ? 60 : 30))}
                    >
                        <Text style={styles.text}>{`${targetFps}\nFPS`}</Text>
                    </PressableOpacity>
                )}
                {canToggleNightMode && (
                    <PressableOpacity
                        style={styles.button}
                        onPress={() => setEnableNightMode(!enableNightMode)}
                        disabledOpacity={0.4}
                    >
                        <Ionicons
                            name={enableNightMode ? "moon" : "moon-outline"}
                            color="white"
                            size={24}
                        />
                    </PressableOpacity>
                )}
                <PressableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate("Devices")}
                >
                    <Ionicons name="settings-outline" color="white" size={24} />
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
        position: "absolute",
        alignSelf: "center",
        bottom: CONTENT_SPACING * 3,
    },
    button: {
        marginBottom: CONTENT_SPACING,
        width: CONTROL_BUTTON_SIZE,
        height: CONTROL_BUTTON_SIZE,
        borderRadius: CONTROL_BUTTON_SIZE / 2,
        backgroundColor: "rgba(140, 140, 140, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    rightButtonRow: {
        alignSelf: "center",
        position: "absolute",
        right: SAFE_AREA_PADDING.paddingRight,
        bottom: 150,
        gap: 10,
        flexDirection: "row",
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
