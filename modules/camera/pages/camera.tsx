import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { Stack, useIsFocused, useSegments } from "expo-router"
import * as React from "react"
import type { GestureResponderEvent } from "react-native"
import { StyleSheet, View } from "react-native"
import { GestureDetector } from "react-native-gesture-handler"
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { CameraRef } from "react-native-vision-camera"
import {
    Camera,
    CommonResolutions,
    useCameraDevice,
    useCameraPermission,
    useVideoOutput,
} from "react-native-vision-camera"

import { CameraBottomBar } from "../components/CameraBottomBar"
import { CameraPermissionNotProvidedCard } from "../components/CameraPermissionNotProvidedCard"
import { CameraStatusLine } from "../components/CameraStatusLine"
import { CancelUploadCard } from "../components/CancelUploadCard"
import { FlashIndicator } from "../components/FlashIndicator"
import { FlipCameraHint } from "../components/FlipCameraHint"
import { MicPermissionNotProvidedCard } from "../components/MicPermissionNotProvidedCard"
import { RecordingProgressHeaderTitle } from "../components/RecordingProgressHeaderTitle"
import { ZoomIndicator } from "../components/ZoomIndicator"
import { CONTENT_SPACING, MAX_ZOOM_FACTOR } from "../constants"
import { useCameraContext } from "../context"
import { useIsForeground } from "../hooks/useIsForeground"
import { usePendingPublish, type PendingPublishItem } from "../hooks/usePendingPublish"
import { usePinchZoomGesture } from "../hooks/usePinchZoomGesture"
import { useRecordingGlow } from "../hooks/useRecordingGlow"
import { useRecordingInterval } from "../hooks/useRecordingInterval"
import { useRequestCameraPermissions } from "../hooks/useRequestCameraPermissions"
import { useZoomDisplay } from "../hooks/useZoomDisplay"
import { uploadMoment } from "../hooks/uploadMoment"
import PersistedContext from "@/contexts/Persisted"
import { notify } from "@/contexts/Toast/notify"

// Timing & recording
const MAX_RECORDING_TIME_SEC = 30
const ZOOM_RESET_ANIM_MS = 220
const ZOOM_INDICATOR_FADE_MS = 150
// Half-gap between the top indicators when both chips are on screen at
// once. Each chip translates this many px away from center so they meet
// in the middle instead of overlapping. Tuned by eye — chips are ~55px
// wide (zoom) and ~110px wide (flash), so 40 gives a tight ~4-8px gap
// between their edges.
const TOP_INDICATOR_HALF_GAP_PX = 40
// Clips shorter than this are treated as accidental taps → silently
// discarded (with a warning notify). Duration comes back from
// onMediaCaptured in seconds.
const MIN_PUBLISHABLE_SEC = 5
// Cancel-window duration between the recording ending and the real upload
// firing. The CancelUploadCard exposes the whole window as a countdown bar.
const UPLOAD_CANCEL_WINDOW_MS = 5000

// Layout
const CAMERA_WIDTH = sizes.moment.full.width
const CAMERA_HEIGHT = sizes.moment.full.height
const CAMERA_RADIUS = 40
const BOTTOM_BAR_OFFSET = CONTENT_SPACING * 7
const FLIP_HINT_ABOVE_BAR = 96
// Standard native-stack nav bar height. Applied as top padding on the root
// container so the preview sits below the (now transparent) header — same
// vertical position it had before headerTransparent was turned on.
const NAV_BAR_HEIGHT = 46

// Video output config — module-scope constant so useVideoOutput's memo deps
// (compared with Object.is) never see a fresh reference between renders.
const VIDEO_OUTPUT_CONFIG = {
    targetResolution: CommonResolutions.FHD_16_9,
    enableAudio: false,
    // Keeps recording alive across a camera flip mid-shot.
    enablePersistentRecorder: true,
} as const

export function CameraPage(): React.ReactElement {
    const { t } = React.useContext(LanguageContext)
    const camera = React.useRef<CameraRef>(null)
    const insets = useSafeAreaInsets()

    const cameraPermission = useCameraPermission()
    const isFocused = useIsFocused()
    const isForeground = useIsForeground()
    const isActive = isFocused && isForeground
    const isOnCreateTab = useSegments().includes("create")

    const {
        isRecording,
        setIsRecording,
        setRecordingTime,
        setTabHide,
        isCameraInitialized,
        setIsCameraInitialized,
        cameraPosition,
        setCameraPosition,
        torch,
        preferredDevice,
        microphonePermission,
    } = useCameraContext()
    const { session } = React.useContext(PersistedContext)

    useRequestCameraPermissions(cameraPermission, microphonePermission, isActive && isOnCreateTab)
    useRecordingInterval(isRecording, setRecordingTime, setIsRecording, MAX_RECORDING_TIME_SEC)

    const autoDevice = useCameraDevice(cameraPosition)
    const device =
        preferredDevice != null && preferredDevice.position === cameraPosition
            ? preferredDevice
            : autoDevice

    const videoOutput = useVideoOutput(VIDEO_OUTPUT_CONFIG)
    const outputs = React.useMemo(() => [videoOutput], [videoOutput])

    const zoom = useSharedValue(1)
    const isPressingButton = useSharedValue(false)
    const minZoom = device?.minZoom ?? 1
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR)

    const pinchGesture = usePinchZoomGesture(zoom, isPressingButton, minZoom, maxZoom)
    const zoomDisplay = useZoomDisplay(zoom)
    const cameraGlowStyle = useRecordingGlow(isRecording)

    const flashOn = torch === "on"
    // Bridge React state → UI-thread shared value so worklets can react
    // to the flash toggle without triggering a re-render on every frame.
    const flashOnSV = useSharedValue(flashOn ? 1 : 0)
    React.useEffect(() => {
        flashOnSV.value = withTiming(flashOn ? 1 : 0, { duration: ZOOM_INDICATOR_FADE_MS })
    }, [flashOn, flashOnSV])

    const zoomIndicatorStyle = useAnimatedStyle(() => {
        const isAtNeutral = Math.abs(zoom.value - 1) < 0.01
        const zoomVisible = isPressingButton.value || !isAtNeutral
        // Slide right by the half-gap when Flash is also on so both chips
        // sit symmetrically around the horizontal center.
        return {
            opacity: withTiming(zoomVisible ? 1 : 0, { duration: ZOOM_INDICATOR_FADE_MS }),
            transform: [
                {
                    translateX: withTiming(
                        flashOnSV.value * TOP_INDICATOR_HALF_GAP_PX,
                        { duration: ZOOM_INDICATOR_FADE_MS },
                    ),
                },
            ],
        }
    })

    const flashIndicatorStyle = useAnimatedStyle(() => {
        const isAtNeutral = Math.abs(zoom.value - 1) < 0.01
        const zoomVisible = isPressingButton.value || !isAtNeutral
        // Slide left by the half-gap when Zoom is also visible.
        return {
            opacity: flashOnSV.value,
            transform: [
                {
                    translateX: withTiming(
                        zoomVisible ? -TOP_INDICATOR_HALF_GAP_PX : 0,
                        { duration: ZOOM_INDICATOR_FADE_MS },
                    ),
                },
            ],
        }
    })

    const setIsPressingButtonCb = React.useCallback(
        (v: boolean) => {
            isPressingButton.value = v
        },
        [isPressingButton],
    )

    const handleFlipCamera = React.useCallback(() => {
        Vibrate("impactMedium")
        zoom.value = 1
        setCameraPosition((p) => (p === "back" ? "front" : "back"))
    }, [setCameraPosition, zoom])

    const handleRecordingStop = React.useCallback(() => {
        setIsRecording(false)
        zoom.value = withTiming(device?.minZoom ?? 1, { duration: ZOOM_RESET_ANIM_MS })
    }, [setIsRecording, zoom, device])

    // Commit → chama uploadMoment DIRETAMENTE com o path do item pendente.
    // Antes o commit fazia setVideo → setTimeout → context.upload(), o que
    // batia num race de closure (a upload() capturava o `video` state antes
    // da re-render commitar). Chamando uploadMoment direto passamos o path
    // como argumento — sem depender de estado — e usamos exatamente a mesma
    // função que a tela de share usa via context.
    const commitPending = React.useCallback(
        async (item: PendingPublishItem) => {
            try {
                await uploadMoment({
                    description: null,
                    userId: session.user.id,
                    videoMetadata: {
                        mimeType: item.mimeType,
                        duration: item.duration,
                    },
                    videoPath: item.path,
                    jwtToken: session.account.jwtToken,
                })
                setCameraPosition("back")
                notify({
                    params: {
                        title: t("Published"),
                        variant: "success",
                        config: { duration: 2400 },
                    },
                })
            } catch (err: any) {
                const status = err?.response?.status
                const message = err?.response?.data?.message ?? err?.message ?? "Unknown"
                notify({
                    params: {
                        title: t("Failed to publish"),
                        description: status
                            ? `HTTP ${status}: ${message}`
                            : String(message),
                        variant: "warning",
                        config: { duration: 3600 },
                    },
                })
            }
        },
        [session.account.jwtToken, session.user.id, setCameraPosition, t],
    )

    const { pending, schedule: schedulePending, cancel: cancelPending } = usePendingPublish({
        windowMs: UPLOAD_CANCEL_WINDOW_MS,
        onCommit: commitPending,
    })

    const onMediaCaptured = React.useCallback(
        async (filePath: string, duration: number) => {
            setIsRecording(false)
            setRecordingTime(0)

            // Accidental-tap guard: too short → drop it and tell the user why.
            if (duration < MIN_PUBLISHABLE_SEC) {
                Vibrate("notificationWarning")
                notify({
                    params: {
                        title: t("Gravação muito curta"),
                        description: t("Grave por pelo menos {{seconds}} segundos", {
                            seconds: MIN_PUBLISHABLE_SEC,
                        }),
                        variant: "warning",
                        config: { duration: 2400 },
                    },
                })
                return
            }

            const fileUri = filePath.startsWith("file://") ? filePath : `file://${filePath}`
            schedulePending({ path: fileUri, duration, mimeType: "video/mp4" })
        },
        [setIsRecording, setRecordingTime, schedulePending, t],
    )

    const onFocusTap = React.useCallback(
        async ({ nativeEvent: e }: GestureResponderEvent) => {
            if (!device?.supportsFocusMetering) return
            try {
                await camera.current?.focusTo({ x: e.locationX, y: e.locationY })
            } catch {
                /* camera not ready */
            }
        },
        [device?.supportsFocusMetering],
    )

    const onSessionConfigSelected = React.useCallback(() => {
        setIsCameraInitialized(true)
    }, [setIsCameraInitialized])

    React.useEffect(() => {
        zoom.value = device?.minZoom ?? 1
    }, [zoom, device])

    React.useEffect(() => {
        setTabHide(false)
    }, [setTabHide])

    const bottomInset = BOTTOM_BAR_OFFSET + insets.bottom
    const topInset = insets.top + NAV_BAR_HEIGHT
    const hasCamera = cameraPermission.hasPermission && device != null

    return (
        <View style={[styles.container, { paddingTop: topInset }]}>
            <Stack.Screen
                options={{
                    headerTitle: isRecording
                        ? () => (
                              <RecordingProgressHeaderTitle
                                  label={t("Recording")}
                                  maxTime={MAX_RECORDING_TIME_SEC}
                              />
                          )
                        : t("New Moment"),
                    headerTitleStyle: {
                        color: colors.gray.white,
                        fontFamily: fonts.family["Black-Italic"],
                    },
                    // Fully transparent — no backdrop, no border. The camera
                    // preview (and its recording glow) extends behind the
                    // title so the purple shadow bleeds into the header area.
                    headerTransparent: true,
                    headerStyle: { backgroundColor: "transparent" },
                    headerShadowVisible: false,
                }}
            />

            {!cameraPermission.hasPermission && <CameraPermissionNotProvidedCard />}
            {!microphonePermission.hasPermission &&
                cameraPermission.hasPermission &&
                !isRecording && (
                    <View style={styles.micPermissionOverlay}>
                        <MicPermissionNotProvidedCard />
                    </View>
                )}

            {hasCamera && (
                <Reanimated.View style={[styles.cameraGlow, cameraGlowStyle]}>
                    <GestureDetector gesture={pinchGesture}>
                        <View onTouchEnd={onFocusTap} style={styles.cameraView} collapsable={false}>
                            <Camera
                                ref={camera}
                                style={styles.cameraInner}
                                device={device}
                                isActive={isActive}
                                outputs={outputs}
                                zoom={zoom}
                                torchMode={torch}
                                // Front cam: mirror preview AND recording so the saved
                                // clip matches what the user saw. Back cam: no mirror.
                                mirrorMode={cameraPosition === "front" ? "on" : "off"}
                                onSessionConfigSelected={onSessionConfigSelected}
                                onError={console.error}
                            />
                            <ZoomIndicator text={zoomDisplay} animatedStyle={zoomIndicatorStyle} />
                            <FlashIndicator animatedStyle={flashIndicatorStyle} />
                        </View>
                    </GestureDetector>
                </Reanimated.View>
            )}

            {hasCamera && (
                <CameraStatusLine
                    minPublishableSec={MIN_PUBLISHABLE_SEC}
                    maxRecordingSec={MAX_RECORDING_TIME_SEC}
                />
            )}

            {pending && (
                <View style={[styles.cancelUploadAnchor, { top: topInset + 12 }]}>
                    <CancelUploadCard
                        onCancel={() => {
                            Vibrate("impactLight")
                            cancelPending()
                            notify({
                                params: {
                                    title: t("Publish cancelled"),
                                    variant: "warning",
                                    config: { duration: 1800 },
                                },
                            })
                        }}
                    />
                </View>
            )}

            {cameraPermission.hasPermission && (
                <>
                    <View
                        pointerEvents="box-none"
                        style={[
                            styles.flipHintAnchor,
                            { bottom: bottomInset + FLIP_HINT_ABOVE_BAR },
                        ]}
                    >
                        <FlipCameraHint isRecording={isRecording} />
                    </View>
                    <CameraBottomBar
                        style={{ bottom: bottomInset }}
                        videoOutput={videoOutput}
                        cameraZoom={zoom}
                        minZoom={minZoom}
                        maxZoom={maxZoom}
                        enabled={isCameraInitialized && isActive}
                        setIsPressingButton={setIsPressingButtonCb}
                        onRecordingStart={() => setIsRecording(true)}
                        onRecordingStop={handleRecordingStop}
                        onFlipCamera={handleFlipCamera}
                        onMediaCaptured={onMediaCaptured}
                    />
                </>
            )}
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
    micPermissionOverlay: {
        position: "absolute",
        top: sizes.paddings["2sm"],
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    // Outer wrapper hosts the animated purple recording glow. No overflow:hidden
    // — iOS clips shadow layers along with the content mask.
    cameraGlow: {
        width: CAMERA_WIDTH,
        height: CAMERA_HEIGHT,
        alignSelf: "center",
        borderRadius: CAMERA_RADIUS,
        shadowColor: colors.purple.purple_07,
        shadowOffset: { width: 0, height: 0 },
    },
    cameraView: {
        width: CAMERA_WIDTH,
        height: CAMERA_HEIGHT,
        backgroundColor: "black",
        borderRadius: CAMERA_RADIUS,
        borderWidth: 1,
        borderColor: colors.gray.grey_08,
        overflow: "hidden",
        alignSelf: "center",
    },
    cameraInner: { flex: 1 },
    flipHintAnchor: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 9,
    },
    cancelUploadAnchor: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 15,
    },
})
