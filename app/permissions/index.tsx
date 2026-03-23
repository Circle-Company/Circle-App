import React from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"

import useAppPermissions, { PermissionStatus } from "@/lib/hooks/useAppPermissions"
import { useToast } from "@/contexts/Toast"
import { usePreferencesStore } from "@/contexts/Persisted/persist.preferences"
import PermissionCard from "@/components/permission/permission.card"
import { TextStyle } from "react-native"
import ButtonStandart from "@/components/buttons/button-standart"
import fonts from "@/constants/fonts"
import { NotificationBadge } from "@/components/notification/notification.badge"
import { NotificationType } from "@/contexts/push.notification"

type StepId = "locationForeground" | "locationBackground" | "pushNotifications"

const STEPS: StepId[] = ["locationForeground", "locationBackground", "pushNotifications"]
function treatAsGranted(status: PermissionStatus) {
    return status === "granted"
}

export default function PermissionsWizardScreen() {
    const router = useRouter()
    const setOnboardingPermissionsCompleted = usePreferencesStore(
        (s) => s.setOnboardingPermissionsCompleted,
    )

    const { items, refresh, requestOne, hasMissingRequired, requiredMissingIds, openSettings } =
        useAppPermissions({
            required: ["locationForeground", "locationBackground", "pushNotifications"],
        })

    const [stepIndex, setStepIndex] = React.useState(0)
    const totalSteps = STEPS.length

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

            if (treatAsGranted(status)) {
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

    const pendingSteps: StepId[] = React.useMemo(() => {
        return STEPS.filter((id) => {
            const it = getItem(id)
            const status = it?.status ?? "unknown"
            return !treatAsGranted(status)
        })
    }, [items])
    const pendingTotal = pendingSteps.length
    // Ensure we auto-jump to the first pending permission step when re-entering
    React.useEffect(() => {
        if (pendingTotal > 0) {
            const firstPending = pendingSteps[0]
            const desiredIndex = STEPS.indexOf(firstPending)
            if (desiredIndex !== -1 && desiredIndex !== stepIndex) {
                setStepIndex(desiredIndex)
            }
        }
    }, [pendingTotal, pendingSteps, stepIndex])

    const handleAllow = async () => {
        const order: StepId[] = ["locationForeground", "locationBackground", "pushNotifications"]

        for (const id of order) {
            const currentStatus = getItem(id)?.status ?? "unknown"
            if (treatAsGranted(currentStatus)) {
                continue
            }

            const result = await requestOne(id)
            await refresh()

            // If requesting Background and it did not grant, open Settings and finish
            if (id === "locationBackground" && result !== "granted") {
                setOnboardingPermissionsCompleted(true)
                router.replace("/(tabs)/moments")
                return
            }
        }

        // Final refresh and immediately navigate if both permissions have been requested
        await refresh()
        const fg = getItem("locationForeground")?.status ?? "unknown"
        const bg = getItem("locationBackground")?.status ?? "unknown"
        if (fg !== "unknown" && bg !== "unknown") {
            setOnboardingPermissionsCompleted(true)
            router.replace("/(tabs)/moments")
            return
        }
    }

    return (
        <View
            style={[
                styles.container,
                {
                    gap: 30,
                },
            ]}
        >
            <LinearGradient
                renderToHardwareTextureAndroid
                colors={["#00000000", "#c29eff"]}
                style={styles.gradient}
            />

            {/* Step content */}
            <View style={{ alignItems: "center" }}>
                <PermissionCard
                    title={"Discover nearby moments and people"}
                    icon={<Text style={{ left: -2, fontSize: 70 }}>📍</Text>}
                />
                <Text style={styles.hint}>
                    Your approximate location is used while you’re using the app to show moments and
                    people near you.
                </Text>
            </View>

            <View style={{ alignItems: "center" }}>
                <PermissionCard
                    title={"Keep nearby recommendations relevant"}
                    icon={<Text style={{ fontSize: 60 }}>🌎</Text>}
                />
                <Text style={styles.hint}>
                    Background location is used to update nearby moments and people recommendations,
                    even when the app isn’t open.
                </Text>
            </View>

            <View style={{ alignItems: "center" }}>
                <PermissionCard
                    title={"Turn on realtime updates"}
                    icon={
                        <View style={{ width: 60, alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: 55 }}>🔔</Text>
                            <View
                                style={{
                                    position: "absolute",
                                    top: -2,
                                    right: -10,
                                }}
                            >
                                <NotificationBadge type={NotificationType.MomentLiked} />
                            </View>
                        </View>
                    }
                />
                <Text style={styles.hint}>
                    Push notifications are used to send you updates about your friends’ activity and
                    interactions with you.
                </Text>
            </View>

            {/* Sticky CTA */}
            <View style={styles.ctaWrapper}>
                <Text style={styles.ctaText}>
                    You can change permissions at any time in app settings
                </Text>
                <ButtonStandart
                    action={handleAllow}
                    backgroundColor={colors.purple.purple_04}
                    margins={false}
                    height={60}
                    animationScale={0.9}
                    style={{ paddingHorizontal: 70 }}
                >
                    <Text style={styles.primaryBtnText}>Continue</Text>
                </ButtonStandart>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray.black,
        alignItems: "center",
    },
    primaryBtnText: {
        color: colors.gray.white,
        fontSize: fonts.size.body * 1.4,
        fontFamily: fonts.family["ExtraBold"],
        fontStyle: "italic",
    } as TextStyle,
    iconStyle: {
        fontSize: 60,
        shadowColor: "black",
    },
    gradient: {
        width: sizes.window.width,
        height: sizes.window.height * 1.5,
        position: "absolute",
        zIndex: 0,
        bottom: 0,
        opacity: 0.06,
    },
    ctaText: {
        color: colors.gray.grey_04,
        fontSize: fonts.size.body * 0.95,
        fontFamily: fonts.family.Regular,
        width: sizes.screens.width * 0.5,
        textAlign: "center",
        marginBottom: sizes.margins["1md"],
    } as TextStyle,
    hint: {
        color: colors.gray.grey_01 + 99,
        fontSize: fonts.size.body * 0.95,
        fontFamily: fonts.family.Regular,
        width: sizes.screens.width * 0.8,
        textAlign: "center",
        marginTop: sizes.margins["1md"],
    } as TextStyle,
    ctaWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: sizes.margins["1xl"] * 1.2,
        paddingHorizontal: sizes.paddings["1md"],
        gap: sizes.margins["1sm"],
        alignItems: "center",
    },
})
