import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { Stack, useIsFocused, useSegments } from "expo-router"
import * as React from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { GestureDetector } from "react-native-gesture-handler"
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import type { CameraRef } from "react-native-vision-camera"
import {
    Camera,
    useCameraDevice,
    useCameraPermission,
    useVideoOutput,
} from "react-native-vision-camera"

import { CameraBottomBar } from "../components/CameraBottomBar"
import { CameraPermissionNotProvidedCard } from "../components/CameraPermissionNotProvidedCard"
import { CameraStatusLine } from "../components/CameraStatusLine"
import { CancelShareCard } from "../components/CancelShareCard"
import { FlashIndicator } from "../components/FlashIndicator"
import { FlipCameraHint } from "../components/FlipCameraHint"
import { HandsFreeHint } from "../components/HandsFreeHint"
import { HandsFreeToggle } from "../components/HandsFreeToggle"
import { MicPermissionNotProvidedCard } from "../components/MicPermissionNotProvidedCard"
import { RecordingProgressHeaderTitle } from "../components/RecordingProgressHeaderTitle"
import { ZoomIndicator } from "../components/ZoomIndicator"
import {
    BOTTOM_BAR_OFFSET,
    CAMERA_HEIGHT,
    CAMERA_RADIUS,
    CAMERA_WIDTH,
    FLIP_HINT_ABOVE_BAR,
    MAX_RECORDING_TIME_SEC,
    MAX_ZOOM_FACTOR,
    MIN_PUBLISHABLE_SEC,
    NAV_BAR_HEIGHT,
    PREVIEW_TOP_OFFSET,
    SHARE_CANCEL_WINDOW_MS,
    TOP_INDICATOR_HALF_GAP_PX,
    VIDEO_OUTPUT_CONFIG,
    ZOOM_INDICATOR_FADE_MS,
    ZOOM_RESET_ANIM_MS,
} from "../constants"
import { useCameraContext } from "../context"
import { useIsForeground } from "../hooks/useIsForeground"
import { usePendingPublish, type PendingPublishItem } from "../hooks/usePendingPublish"
import { usePinchZoomGesture } from "../hooks/usePinchZoomGesture"
import { useRecordingGlow } from "../hooks/useRecordingGlow"
import { useRecordingInterval } from "../hooks/useRecordingInterval"
import { useRequestCameraPermissions } from "../hooks/useRequestCameraPermissions"
import { useZoomDisplay } from "../hooks/useZoomDisplay"
import { POLL_TIMEOUT_CODE, shareMoment, type SharePhase } from "../hooks/shareMoment"
import PersistedContext from "@/contexts/Persisted"
import { notify } from "@/contexts/Toast/notify"
import { InboxHeaderButton } from "@/components/general/inbox-header-button"
import config from "@/config"

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
        setIsSharing,
        isHandsFree,
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
    // Bridge React state → shared value so the pinch worklet can read it
    // without triggering a JS re-render for every gesture frame.
    const handsFreeSV = useSharedValue(isHandsFree)
    React.useEffect(() => {
        handsFreeSV.value = isHandsFree
    }, [isHandsFree, handsFreeSV])
    const minZoom = device?.minZoom ?? 1
    const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR)

    const pinchGesture = usePinchZoomGesture(zoom, isPressingButton, handsFreeSV, minZoom, maxZoom)
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
                    translateX: withTiming(flashOnSV.value * TOP_INDICATOR_HALF_GAP_PX, {
                        duration: ZOOM_INDICATOR_FADE_MS,
                    }),
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
                    translateX: withTiming(zoomVisible ? -TOP_INDICATOR_HALF_GAP_PX : 0, {
                        duration: ZOOM_INDICATOR_FADE_MS,
                    }),
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

    // Hands-free: user pressed and held the record button (a no-op in this
    // mode). Nudge them to tap instead via the HandsFreeHint chip. Bumping
    // the trigger (re)shows the chip; throttled so repeated holds don't
    // restart the animation on every frame.
    const [handsFreeHintTrigger, setHandsFreeHintTrigger] = React.useState(0)
    const handsFreeHintAtRef = React.useRef(0)
    const handleHandsFreeHoldHint = React.useCallback(() => {
        const now = Date.now()
        if (now - handsFreeHintAtRef.current < 2500) return
        handsFreeHintAtRef.current = now
        Vibrate("notificationWarning")
        setHandsFreeHintTrigger((n) => n + 1)
    }, [])

    // Companion trigger for the "aperte e segure para gravar" hint chip.
    // Bumped from onMediaCaptured when a clip is discarded for being under
    // MIN_PUBLISHABLE_SEC (accidental-tap guard), replacing the old notify
    // toast that used to fire in the same spot.
    const [holdHintTrigger, setHoldHintTrigger] = React.useState(0)

    const handleRecordingStop = React.useCallback(() => {
        setIsRecording(false)
        zoom.value = withTiming(device?.minZoom ?? 1, { duration: ZOOM_RESET_ANIM_MS })
    }, [setIsRecording, zoom, device])

    // Share lifecycle beyond the cancel window: keeps the CancelShareCard
    // on screen through the whole flow (spinner during share, animated
    // check on success) and lets the user abort mid-share via the same
    // Cancel button.
    const [shareStatus, setShareStatus] = React.useState<"sharing" | "success" | null>(null)
    const [sharePhase, setSharePhase] = React.useState<SharePhase | null>(null)
    const shareAbortRef = React.useRef<AbortController | null>(null)
    // 0..1 durante o PUT direto ao Azure. Reanimated shared value pra
    // renderizar barra de progresso na CancelShareCard sem forçar React
    // re-render por ~30 fps de callbacks do expo-file-system.
    const uploadProgress = useSharedValue(0)
    // Path of the clip currently in the share card. Held separately from
    // `pending` so the first-frame preview stays on screen through the whole
    // flow — `pending` is cleared once the real upload fires (and on success).
    const [sharePreviewPath, setSharePreviewPath] = React.useState<string | null>(null)
    const successDismissTimerRef = React.useRef<NodeJS.Timeout | null>(null)
    React.useEffect(
        () => () => {
            if (successDismissTimerRef.current) clearTimeout(successDismissTimerRef.current)
            shareAbortRef.current?.abort()
        },
        [],
    )

    // Commit → chama o pipeline SAS do shareMoment (upload-url + PUT + confirm + poll).
    // Ver `SHARE_MOMENT_SAS_MIGRATION.md` para o detalhamento das fases.
    const commitPending = React.useCallback(
        async (item: PendingPublishItem) => {
            const controller = new AbortController()
            shareAbortRef.current = controller
            setShareStatus("sharing")
            setSharePhase(null)
            uploadProgress.value = 0
            try {
                await shareMoment({
                    description: null,
                    userId: session.user.id,
                    videoMetadata: {
                        mimeType: item.mimeType,
                        duration: item.duration,
                    },
                    videoPath: item.path,
                    jwtToken: session.account.jwtToken,
                    signal: controller.signal,
                    onPhaseChange: (phase) => setSharePhase(phase),
                    onUploadProgress: (frac) => {
                        uploadProgress.value = withTiming(frac, { duration: 200 })
                    },
                })
                setShareStatus("success")
                setSharePhase(null)
                setCameraPosition("back")
                if (successDismissTimerRef.current) {
                    clearTimeout(successDismissTimerRef.current)
                }
                successDismissTimerRef.current = setTimeout(() => {
                    setShareStatus(null)
                    setSharePreviewPath(null)
                    successDismissTimerRef.current = null
                }, 1400)
            } catch (err: any) {
                setSharePhase(null)
                // Aborted shares reject with an AbortError — that path is
                // driven by the user tapping Cancel and already gets its own
                // toast, so we skip the failure notify here.
                const aborted =
                    err?.name === "AbortError" ||
                    err?.name === "CanceledError" ||
                    err?.code === "ERR_CANCELED"
                if (aborted) {
                    setShareStatus(null)
                    return
                }
                // Polling timeout ≠ falha: o servidor continua processando
                // e vai publicar em background. Dismiss silencioso + toast
                // otimista.
                if (err?.code === POLL_TIMEOUT_CODE) {
                    setShareStatus(null)
                    setSharePreviewPath(null)
                    setCameraPosition("back")
                    notify({
                        params: {
                            title: t("Publicando em segundo plano"),
                            variant: "success",
                            config: { duration: 3000 },
                        },
                    })
                    return
                }
                setShareStatus(null)
                const status = err?.response?.status
                const message = err?.response?.data?.message ?? err?.message ?? "Unknown"
                notify({
                    params: {
                        title: t("Failed to share"),
                        description: status ? `HTTP ${status}: ${message}` : String(message),
                        variant: "warning",
                        config: { duration: 3600 },
                    },
                })
            } finally {
                if (shareAbortRef.current === controller) {
                    shareAbortRef.current = null
                }
            }
        },
        [session.account.jwtToken, session.user.id, setCameraPosition, t, uploadProgress],
    )

    const {
        pending,
        schedule: schedulePending,
        cancel: cancelPending,
    } = usePendingPublish({
        windowMs: SHARE_CANCEL_WINDOW_MS,
        onCommit: commitPending,
    })

    // Bridge the whole share-card lifecycle to the context so bottom-bar
    // buttons (capture, rotate, flash) lock themselves for the duration.
    // Includes the cancel window, the actual upload, AND the success
    // check-mark display — buttons only re-enable once the card fully
    // dismisses. Flash also uses this flag to snapshot + restore its torch
    // state (see flashButton.tsx).
    const isSharingActive = pending !== null || shareStatus !== null
    React.useEffect(() => {
        setIsSharing(isSharingActive)
    }, [isSharingActive, setIsSharing])

    const onMediaCaptured = React.useCallback(
        async (filePath: string, duration: number) => {
            setIsRecording(false)
            setRecordingTime(0)

            // Accidental-tap guard: too short → drop it and surface the
            // "aperte e segure para gravar" hint chip. Replaces the old
            // toast/notify so the message lives in-context above the
            // capture button instead of pulling the user's eyes to the top
            // of the screen.
            if (duration < MIN_PUBLISHABLE_SEC) {
                Vibrate("notificationWarning")
                setHoldHintTrigger((n) => n + 1)
                return
            }

            const fileUri = filePath.startsWith("file://") ? filePath : `file://${filePath}`
            setSharePreviewPath(fileUri)
            schedulePending({ path: fileUri, duration, mimeType: "video/mp4" })
        },
        [setIsRecording, setRecordingTime, schedulePending, t],
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
    const topInset = insets.top + NAV_BAR_HEIGHT + PREVIEW_TOP_OFFSET
    const hasCamera = cameraPermission.hasPermission && device != null

    const permissionOverlay: ViewStyle = {
        position: "absolute",
        top: topInset + sizes.margins["3sm"],
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    }
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
                        : config.APPLICATION_NAME,
                    headerTitleStyle: {
                        color: colors.gray.white,
                        fontFamily: fonts.family["Black-Italic"],
                        fontSize: fonts.size.title2 * 0.9,
                    },
                    // Fully transparent — no backdrop, no border. The camera
                    // preview (and its recording glow) extends behind the
                    // title so the purple shadow bleeds into the header area.
                    headerTransparent: true,
                    headerStyle: { backgroundColor: "transparent" },
                    headerShadowVisible: false,
                    // Botão de notificações (movido da tela de moments). Oculto
                    // durante a gravação, quando o título vira o progresso.
                    headerRight: isRecording ? undefined : () => <InboxHeaderButton />,
                }}
            />

            {!cameraPermission.hasPermission && <CameraPermissionNotProvidedCard />}
            {!microphonePermission.hasPermission &&
                cameraPermission.hasPermission &&
                !isRecording && (
                    <View style={permissionOverlay}>
                        <MicPermissionNotProvidedCard />
                    </View>
                )}

            {hasCamera && (
                <Reanimated.View style={[styles.cameraGlow, cameraGlowStyle]}>
                    <GestureDetector gesture={pinchGesture}>
                        <View style={styles.cameraView} collapsable={false}>
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
                                // Native tap-to-focus: vision-camera's own
                                // gesture recognizer on the PreviewView handles
                                // the touch → focusTo pipeline entirely on the
                                // native side, coexisting with the pinch
                                // GestureHandler around it.
                                enableNativeTapToFocusGesture
                                onSessionConfigSelected={onSessionConfigSelected}
                                onError={console.error}
                            />
                            <ZoomIndicator text={zoomDisplay} animatedStyle={zoomIndicatorStyle} />
                            <FlashIndicator animatedStyle={flashIndicatorStyle} />
                            {microphonePermission.hasPermission && <HandsFreeToggle />}
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

            {(pending || shareStatus) && (
                <CancelShareCard
                    // Success is the only phase where Cancel is not shown —
                    // cancellable, uploading and sharing all let the user
                    // back out; polling can't be cancelled server-side, so
                    // we hide the button once we enter that phase.
                    status={
                        shareStatus === "success" ? "success" : pending ? "cancellable" : "sharing"
                    }
                    phase={sharePhase}
                    uploadProgress={uploadProgress}
                    canCancel={shareStatus !== "success" && sharePhase !== "polling"}
                    mediaPath={pending?.path ?? sharePreviewPath ?? undefined}
                    onCancel={() => {
                        Vibrate("impactLight")
                        // If we're still in the undo window, kill the pending
                        // timer. If the real share is already firing, abort
                        // the in-flight request (compression + axios) via the
                        // AbortController held in shareAbortRef.
                        if (pending) {
                            cancelPending()
                        } else if (shareAbortRef.current) {
                            shareAbortRef.current.abort()
                            setShareStatus(null)
                        }
                        setSharePreviewPath(null)
                        notify({
                            params: {
                                title: t("Share cancelled"),
                                variant: "warning",
                                config: { duration: 1800 },
                            },
                        })
                    }}
                />
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
                        <HandsFreeHint
                            trigger={handsFreeHintTrigger}
                            label={t("Free hands on, touch to record")}
                        />
                        <HandsFreeHint
                            trigger={holdHintTrigger}
                            label={t("Aperte e segure para gravar")}
                        />
                    </View>
                    <CameraBottomBar
                        style={{ bottom: bottomInset }}
                        videoOutput={videoOutput}
                        cameraZoom={zoom}
                        minZoom={minZoom}
                        maxZoom={maxZoom}
                        enabled={isCameraInitialized && isActive && !isSharingActive}
                        handsFree={isHandsFree}
                        setIsPressingButton={setIsPressingButtonCb}
                        onRecordingStart={() => setIsRecording(true)}
                        onRecordingStop={handleRecordingStop}
                        onFlipCamera={handleFlipCamera}
                        onMediaCaptured={onMediaCaptured}
                        onHandsFreeHoldHint={handleHandsFreeHoldHint}
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
    // Outer wrapper hosts the animated purple recording glow. No overflow:hidden
    // — iOS clips shadow layers along with the content mask.
    cameraGlow: {
        width: CAMERA_WIDTH,
        height: CAMERA_HEIGHT,
        alignSelf: "center",
        borderRadius: CAMERA_RADIUS,
        shadowColor: colors.purple.purple_05,
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
})
