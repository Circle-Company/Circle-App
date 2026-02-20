import React from "react"
import { Platform, Pressable, StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"

import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

import CameraIcon from "@/assets/icons/svgs/camera.svg"
import MicrophoneIcon from "@/assets/icons/svgs/globe_americas.svg"
import MediaLibraryIcon from "@/assets/icons/svgs/moments.svg"
import LocationForegroundIcon from "@/assets/icons/svgs/arrow-thic-down.svg"
import LocationBackgroundIcon from "@/assets/icons/svgs/map.svg"

import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"

import useAppPermissions, { PermissionItem, PermissionStatus } from "@/lib/hooks/useAppPermissions"
import { useToast } from "@/contexts/Toast"
import { usePreferencesStore } from "@/contexts/Persisted/persist.preferences"
import PermissionCard from "@/components/permission/permission.card"
import PermissionCTA from "@/components/permission/permission.cta"
import { TextStyle } from "react-native"

type StepId = "camera" | "microphone" | "mediaLibrary" | "locationForeground" | "locationBackground"

const STEPS: StepId[] = [
    "camera",
    "microphone",
    "mediaLibrary",
    "locationForeground",
    "locationBackground",
]

const TITLES: Record<StepId, string> = {
    camera: "Record your Moments with camera",
    microphone: "Give your Moments a voice",
    mediaLibrary: "Choose from your library",
    locationForeground: "See what’s nearby (while using the app)",
    locationBackground: "Keep nearby suggestions fresh",
}

const DESCRIPTIONS: Record<StepId, string> = {
    camera: "Circle App use your camera to capture Moments and create posts right from the app.",
    microphone:
        "Allow audio recording so your videos and voice notes include clear, high‑quality sound.",
    mediaLibrary:
        "Give access to your photo and video library to select, upload, and share media. You can choose limited access if you prefer.",
    locationForeground:
        "Share your approximate location while using the app to discover nearby content and experiences that match where you are.",
    locationBackground:
        "Enable occasional background location updates to keep nearby recommendations fresh.",
}

function treatAsGranted(id: StepId, status: PermissionStatus) {
    // Media Library: "limited" is acceptable to proceed
    if (id === "mediaLibrary") {
        return status === "granted" || status === "limited"
    }
    return status === "granted"
}

export default function PermissionsWizardScreen() {
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const toast = useToast()
    const setOnboardingPermissionsCompleted = usePreferencesStore(
        (s) => s.setOnboardingPermissionsCompleted,
    )
    const shouldUseGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const { items, refresh, requestOne, hasMissingRequired, requiredMissingIds, openSettings } =
        useAppPermissions()

    const [stepIndex, setStepIndex] = React.useState(0)
    const totalSteps = STEPS.length
    const currentId: StepId = STEPS[Math.min(stepIndex, totalSteps - 1)]
    const currentItem = items.find((it) => it.id === currentId)

    const getItem = (id: StepId) => items.find((it) => it.id === id)

    // Refresh on focus
    useFocusEffect(
        React.useCallback(() => {
            let mounted = true
            ;(async () => {
                if (!mounted) return
                await refresh()
            })()
            return () => {
                mounted = false
            }
        }, [refresh]),
    )

    // Auto-close when all required are granted
    React.useEffect(() => {
        if (!hasMissingRequired) {
            setOnboardingPermissionsCompleted(true)
            router.replace("/(tabs)/moments")
        }
    }, [hasMissingRequired, router, setOnboardingPermissionsCompleted])

    // Auto-advance through already-granted steps (or mediaLibrary limited)
    React.useEffect(() => {
        // Try to move forward while current step is effectively done
        let idx = stepIndex
        while (idx < totalSteps) {
            const id = STEPS[idx]
            const it = getItem(id)
            const status = it?.status ?? "unknown"

            // For BG location, only ask if FG granted; if not, we can skip for now
            if (id === "locationBackground") {
                const fg = getItem("locationForeground")
                if (fg?.status !== "granted") {
                    // can't process BG yet; stop here (user will see this step but button will hint FG first)
                    break
                }
            }

            if (treatAsGranted(id, status)) {
                idx += 1
            } else {
                break
            }
        }

        if (idx !== stepIndex) {
            // If we advanced beyond last, don't exceed array
            setStepIndex(Math.min(idx, totalSteps - 1))
        }
    }, [items, stepIndex, totalSteps])

    const progressRatio = Math.min((stepIndex + 1) / totalSteps, 1)

    const handleAllow = async () => {
        // Special handling for BG location: require FG first
        if (currentId === "locationBackground") {
            const fg = getItem("locationForeground")
            if (fg?.status !== "granted") {
                toast.show({
                    title: "Grant Foreground Location first",
                    duration: 1800,
                })
                return
            }
        }

        const result = await requestOne(currentId)
        await refresh()

        if (result === "granted" || (currentId === "mediaLibrary" && result === "limited")) {
            toast.success("Permission granted", { duration: 1200 })
            goNext()
        } else if (result === "limited") {
            toast.show({ title: "Limited access enabled", duration: 1600 })
            goNext()
        } else {
            // denied — open Settings so the user can enable it manually (after prior denial)
            toast.error("Permission denied. Opening Settings…", { duration: 1200 })
            await openSettings()
        }
    }

    const handleNotNow = () => {
        if (stepIndex >= totalSteps - 1) {
            setOnboardingPermissionsCompleted(true)
            router.replace("/(tabs)/moments")
        } else {
            goNext()
        }
    }

    const handleOpenSettings = async () => {
        await openSettings()
    }

    const goNext = () => {
        if (stepIndex < totalSteps - 1) {
            setStepIndex(stepIndex + 1)
        } else {
            // End of wizard: if all required done, auto-close via the effect; otherwise remain open.
            if (!hasMissingRequired) {
                if (router?.canGoBack?.()) {
                    router.back()
                } else {
                    router.replace("/(tabs)/moments")
                }
            } else {
                // Optional: help user reach Settings on finish when required are still missing
                const missing = requiredMissingIds
                if (missing.length > 0) {
                    toast.show({
                        title: "Some permissions are still missing",
                        duration: 1800,
                    })
                }
            }
        }
    }

    // Derived UI values
    const title = TITLES[currentId] || currentItem?.title
    const description = DESCRIPTIONS[currentId] || currentItem?.description
    const canAskAgain = currentItem?.canAskAgain
    const status = currentItem?.status ?? "unknown"
    const isGranted = treatAsGranted(currentId, status)

    const isLastStep = stepIndex === totalSteps - 1
    const showOpenSettings = status === "denied" && canAskAgain === false

    // For BG location, block immediate Allow if FG missing, showing hint
    const requiresFGFirst =
        currentId === "locationBackground" && getItem("locationForeground")?.status !== "granted"

    const inferiorGradient: any = {
        width: sizes.window.width,
        height: sizes.window.height * 1.5,
        position: "absolute",
        zIndex: 0,
        bottom: 0,
        opacity: 0.07,
    }

    const iconStyle: TextStyle = {
        fontSize: 100,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    }
    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: Math.max(insets.top, 16),
                    paddingBottom: Math.max(insets.bottom, 12),
                },
            ]}
        >
            <LinearGradient
                renderToHardwareTextureAndroid
                colors={["#00000000", "#c29eff"]}
                style={inferiorGradient}
            />
            {/* Header + Progress */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Allow Permissions</Text>
                <Text style={styles.headerLead}>
                    Circle App need some permissions to provide best experience for you
                </Text>

                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
                </Text>
            </View>

            {/* Step content */}
            <PermissionCard
                title={title as any}
                icon={
                    currentId === "camera" ? (
                        <Text style={iconStyle}>📷</Text>
                    ) : currentId === "microphone" ? (
                        <Text style={iconStyle}>🎙️</Text>
                    ) : currentId === "mediaLibrary" ? (
                        <Text style={iconStyle}>🤩</Text>
                    ) : currentId === "locationForeground" ? (
                        <Text style={iconStyle}>📍</Text>
                    ) : (
                        <Text style={iconStyle}>🌎</Text>
                    )
                }
                description={description as any}
                hint={
                    requiresFGFirst
                        ? "Please enable “Location Access (Foreground)” first to allow background location."
                        : undefined
                }
                okText={isGranted ? "This permission is already enabled." : undefined}
            />

            {/* Sticky CTA */}
            <View style={styles.ctaWrapper}>
                {shouldUseGlass ? (
                    <GlassContainer spacing={10}>
                        <GlassView
                            style={{
                                ...styles.ctaBar,
                                paddingTop: requiresFGFirst || isGranted ? 10 : 20,
                            }}
                            colorScheme="dark"
                            glassEffectStyle="clear"
                            isInteractive={true}
                            tintColor={colors.gray.grey_09 + "90"}
                        >
                            <PermissionCTA
                                onAllow={handleAllow}
                                onSkip={handleNotNow}
                                onOpenSettings={showOpenSettings ? handleOpenSettings : undefined}
                                disabledAllow={requiresFGFirst || isGranted}
                                allowLabel={"Allow"}
                                skipLabel={isLastStep ? "Finish" : "Not now"}
                            />
                        </GlassView>
                    </GlassContainer>
                ) : (
                    <View style={[styles.ctaBar, { backgroundColor: colors.gray.grey_09 }]}>
                        <PermissionCTA
                            onAllow={handleAllow}
                            onSkip={handleNotNow}
                            onOpenSettings={showOpenSettings ? handleOpenSettings : undefined}
                            disabledAllow={requiresFGFirst || isGranted}
                            allowLabel={isLastStep ? "Allow" : "Allow"}
                            skipLabel={isLastStep ? "Finish" : "Not now"}
                        />
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray.black,
    },

    // Header / progress
    header: {
        alignItems: "center",
        paddingTop: sizes.screens.height * 0.07,
        paddingBottom: sizes.margins["1md"] * 1.3,
        paddingHorizontal: sizes.paddings["1md"],
    },
    headerTitle: {
        fontSize: Fonts.size.title1,
        color: colors.gray.white,
        fontFamily: Fonts.family["Black-Italic"],
        marginBottom: sizes.margins["1sm"],
    },
    headerLead: {
        marginTop: sizes.margins["1sm"],
        fontSize: Fonts.size.body * 1.1,
        color: colors.gray.grey_04,
        fontFamily: Fonts.family.Medium,
        textAlign: "center",
    },
    progressBar: {
        width: sizes.screens.width - sizes.paddings["1md"] * 2,
        height: 10,
        backgroundColor: colors.gray.grey_08,
        borderRadius: 999,
        overflow: "hidden",
        marginTop: sizes.margins["1md"],
    },
    progressFill: {
        height: "100%",
        backgroundColor: colors.purple.purple_00,
        borderRadius: 999,
    },
    progressText: {
        marginTop: sizes.margins["2sm"],
        color: colors.gray.grey_04,
        fontStyle: "italic",
        fontSize: Fonts.size.footnote,
        fontFamily: Fonts.family.Medium,
    },

    // Card
    card: {
        borderRadius: sizes.borderRadius["1lg"] * 1.1,
        backgroundColor: colors.gray.grey_08,
        paddingHorizontal: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["1md"],
        marginHorizontal: sizes.paddings["1md"],
    },
    cardTitle: {
        fontSize: Fonts.size.body * 1.25,
        color: colors.gray.white,
        fontFamily: Fonts.family["Bold"],
    },
    cardSubtitle: {
        fontSize: Fonts.size.callout,
        color: colors.gray.grey_04,
        fontFamily: Fonts.family.Medium,
        marginTop: sizes.margins["1sm"],
    },
    statusRow: {
        marginTop: sizes.margins["1md"],
        flexDirection: "row",
        alignItems: "center",
        gap: sizes.margins["1sm"],
    },
    statusChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
    },
    statusChipText: {
        fontSize: Fonts.size.caption2,
        fontFamily: Fonts.family["Bold"],
    },
    okText: {
        marginTop: sizes.margins["1sm"],
        color: colors.green.green_05,
        fontSize: Fonts.size.footnote,
        fontFamily: Fonts.family.Medium,
    },
    hintText: {
        marginTop: sizes.margins["1sm"],
        color: colors.yellow.yellow_03,
        fontSize: Fonts.size.footnote,
        fontFamily: Fonts.family.Medium,
    },

    // CTA area
    ctaWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: sizes.paddings["1md"],
        gap: sizes.margins["1sm"],
    },
    ctaBar: {
        marginBottom: sizes.margins["1md"],
        borderRadius: 44,
        paddingTop: 20,
        paddingBottom: sizes.paddings["1sm"],
        paddingHorizontal: 20,
    },
    ctaContent: {
        alignItems: "center",
        justifyContent: "center",
        gap: sizes.margins["1sm"],
    },
    primaryBtn: {
        width: "100%",
        backgroundColor: colors.purple.purple_00,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },
    primaryBtnDisabled: {
        backgroundColor: colors.gray.grey_07,
    },
    primaryBtnText: {
        color: colors.gray.black,
        fontSize: Fonts.size.body * 1.05,
        fontFamily: Fonts.family["Black"],
    },
    secondaryBtn: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },
    secondaryBtnText: {
        color: colors.gray.white,
        fontSize: Fonts.size.body * 1.05,
        fontFamily: Fonts.family["Black"],
    },
    linkBtn: {
        paddingVertical: 8,
    },
    linkBtnText: {
        color: colors.purple.purple_00,
        fontSize: Fonts.size.footnote,
        fontFamily: Fonts.family["Bold-Italic"],
        textDecorationLine: "underline",
    },

    // press states
    pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
    pressedLight: { opacity: 0.7 },
})
