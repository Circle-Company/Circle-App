import React from "react"
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import { useVideoPlayer, VideoView } from "expo-video"
import {
    GlassContainer,
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from "expo-glass-effect"
import Reanimated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated"

import ButtonStandart from "@/components/buttons/button-standart"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"

import { AnimatedCheck } from "./AnimatedCheck"
import type { SharePhase } from "../hooks/shareMoment"

export type CancelShareCardStatus = "cancellable" | "sharing" | "success"

interface Props {
    status: CancelShareCardStatus
    onCancel: () => void
    /** Local `file://` path of the clip being shared, used to render the
     *  first-frame preview in place of the placeholder emoji. */
    mediaPath?: string
    /** Sub-phase of the sharing pipeline. Drives the visual choice between
     *  spinner (requesting/confirming/polling) and progress bar (uploading). */
    phase?: SharePhase | null
    /** 0..1 progress of the PUT to Azure. Ignored unless `phase === "uploading"`. */
    uploadProgress?: SharedValue<number>
    /** Whether the Cancel button should be visible. Parent hides it during
     *  the polling phase because the moment cannot be aborted server-side once
     *  confirm returns. */
    canCancel?: boolean
}

/**
 * Contextual subtitle based on the sub-phase of the sharing pipeline. Success
 * gets a fixed "moment is live" line; the other phases label whether we're
 * negotiating the upload URL, actively pushing bytes, confirming, or waiting
 * on the server to finish processing.
 */
function pickSubtitle(
    t: (k: string) => string,
    isSuccess: boolean,
    phase: SharePhase | null | undefined,
): string {
    if (isSuccess) return t("Your moment is now live")
    switch (phase) {
        case "requesting":
            return t("Preparando envio")
        case "uploading":
            return t("Enviando vídeo")
        case "confirming":
            return t("Quase lá")
        case "polling":
            return t("Processando no servidor")
        default:
            return t("Your moment is going live")
    }
}

/**
 * Thin horizontal progress bar that mirrors a Reanimated shared value from
 * 0 → 1. Used during the "uploading" phase in place of the ActivityIndicator
 * to give the user real feedback about the PUT to Azure.
 */
function ProgressBar({ progress }: { progress: SharedValue<number> }): React.ReactElement {
    const fillStyle = useAnimatedStyle(() => ({
        width: `${Math.min(1, Math.max(0, progress.value)) * 100}%`,
    }))
    return (
        <View style={styles.progressTrack}>
            <Reanimated.View style={[styles.progressFill, fillStyle]} />
        </View>
    )
}

/**
 * Loops the recorded clip as a small vertical preview inside the share card.
 * Muted and auto-playing so the user sees exactly what they're about to
 * publish. The 📷 emoji stays as the parent's fallback when no path is passed.
 */
function RecordPreview({ uri }: { uri: string }): React.ReactElement {
    const player = useVideoPlayer(uri, (p) => {
        p.loop = true
        p.muted = true
        p.play()
    })

    return (
        <View style={styles.preview}>
            <VideoView
                player={player}
                style={styles.previewVideo}
                contentFit="cover"
                nativeControls={false}
                allowsPictureInPicture={false}
                accessible={false}
            />
        </View>
    )
}

/**
 * Full-screen "Sharing…" / "Shared" overlay. Same visual language as
 * `src/features/moments/feed/render-tutorial-dialog.tsx`.
 *
 *  - `cancellable`: user is still inside the undo window. Spinner + Cancel
 *    button; whole card intent is "you can back out".
 *  - `sharing`: the real network request is in flight. Cancel stays and
 *    aborts compression + axios via the parent's AbortController.
 *  - `success`: share finished. Spinner is replaced by an animated
 *    checkmark and the copy shifts to a "Shared" tone. The parent
 *    auto-dismisses the card a moment later.
 */
export function CancelShareCard({
    status,
    onCancel,
    mediaPath,
    phase,
    uploadProgress,
    canCancel,
}: Props): React.ReactElement {
    const { t } = React.useContext(LanguageContext)
    const useGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const isSuccess = status === "success"
    // Cancel visibility: caller-controlled (falls back to "always visible except on success"
    // if the parent doesn't pass anything explicit). Parent hides it during polling.
    const showCancel = canCancel === undefined ? !isSuccess : canCancel

    const title = isSuccess ? t("Shared") : t("Sharing")
    const subTitle = pickSubtitle(t, isSuccess, phase)

    const Content = (
        <View style={styles.contentColumn}>
            {!isSuccess &&
                (mediaPath ? (
                    <RecordPreview uri={mediaPath} />
                ) : (
                    <Text style={styles.cameraEmoji}>📷</Text>
                ))}
            <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                {subTitle ? <Text style={styles.subTitle}>{subTitle}</Text> : null}
            </View>
            <View style={styles.iconSlot}>
                {isSuccess ? (
                    <AnimatedCheck size={72} />
                ) : phase === "uploading" && uploadProgress ? (
                    <ProgressBar progress={uploadProgress} />
                ) : (
                    <ActivityIndicator size="small" color={colors.gray.white} />
                )}
            </View>
            {showCancel && (
                <View style={styles.actions}>
                    <ButtonStandart
                        action={onCancel}
                        backgroundColor={colors.gray.white}
                        margins={false}
                        animationScale={0.92}
                    >
                        <Text style={styles.primaryBtnText}>{t("Cancel")}</Text>
                    </ButtonStandart>
                </View>
            )}
        </View>
    )

    if (useGlass) {
        return (
            <View style={styles.backdrop} pointerEvents="box-none">
                <GlassContainer spacing={10}>
                    <GlassView
                        colorScheme="dark"
                        style={styles.glassContainer}
                        colorScheme="dark"
                        glassEffectStyle="regular"
                        isInteractive={true}
                        tintColor={colors.gray.grey_09 + "50"}
                    >
                        {Content}
                    </GlassView>
                </GlassContainer>
            </View>
        )
    }

    return (
        <BlurView intensity={50} style={styles.backdrop} pointerEvents="box-none" tint="dark">
            <View style={styles.container}>{Content}</View>
        </BlurView>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        position: "absolute",
        top: -80,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0)",
        zIndex: 20,
    },
    container: {
        width: sizes.screens.width * 0.62,
        backgroundColor: colors.gray.grey_08,
        borderRadius: sizes.borderRadius["1lg"] * 1.3,
        paddingVertical: sizes.paddings["1md"] * 1.1,
        paddingHorizontal: sizes.paddings["1md"],
        alignSelf: "center",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    glassContainer: {
        width: sizes.screens.width * 0.62,
        borderRadius: sizes.borderRadius["1lg"] * 1.8,
        paddingTop: sizes.paddings["1xl"],
        paddingBottom: sizes.paddings["1md"] * 1.1,
        paddingHorizontal: sizes.paddings["1sm"],
        alignSelf: "center",
        alignItems: "flex-start",
        justifyContent: "center",
    },
    contentColumn: {
        alignItems: "center",
        width: "100%",
    },
    copy: {
        marginBottom: sizes.margins["1md"],
        alignItems: "center",
        justifyContent: "center",
    },
    cameraEmoji: {
        fontSize: 64,
        lineHeight: 74,
        textAlign: "center",
        marginBottom: sizes.margins["1sm"],
    },
    preview: {
        width: 112,
        height: 112 * 1.566,
        borderRadius: sizes.borderRadius["1md"],
        backgroundColor: colors.gray.grey_07,
        marginBottom: sizes.margins["2sm"],
        // Light black drop shadow lifting the preview off the card surface.
        shadowColor: colors.gray.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    previewVideo: {
        width: "100%",
        height: "100%",
        borderRadius: sizes.borderRadius["1md"],
    },
    title: {
        fontSize: fonts.size.headline,
        fontFamily: fonts.family.ExtraBold,
        color: colors.gray.white,
        marginBottom: sizes.margins["1sm"],
        textAlign: "center",
    },
    subTitle: {
        fontSize: fonts.size.subheadline,
        fontFamily: fonts.family.Semibold,
        color: colors.gray.white,
        marginBottom: sizes.margins["1sm"],
        textAlign: "center",
    },
    iconSlot: {
        width: 132,
        minHeight: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: sizes.margins["1md"],
    },
    progressTrack: {
        width: "100%",
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: colors.gray.white,
        borderRadius: 2,
    },
    description: {
        fontSize: fonts.size.body * 0.95,
        fontFamily: fonts.family.Medium,
        color: colors.gray.grey_04,
        maxWidth: sizes.screens.width * 0.7,
        textAlign: "center",
        marginBottom: sizes.margins["1md"],
    },
    actions: {
        marginTop: 0,
        width: "100%",
        alignItems: "center",
    },
    primaryBtnText: {
        color: colors.gray.black,
        fontSize: fonts.size.body * 1.15,
        fontFamily: fonts.family.ExtraBold,
        fontStyle: "italic",
    },
})
