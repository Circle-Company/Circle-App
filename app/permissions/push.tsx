import React from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import * as Notifications from "expo-notifications"

import { Text } from "@/components/Themed"
import PermissionCard from "@/components/permission/permission.card"
import ButtonStandart from "@/components/buttons/button-standart"

import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import fonts from "@/constants/fonts"
import { TextStyle } from "react-native"

import { usePreferencesStore } from "@/contexts/Persisted/persist.preferences"
import { usePushNotifications } from "@/contexts/push.notification"
import { Image } from "expo-image"

export default function PushPermissionScreen() {
    const router = useRouter()
    const { refresh } = usePushNotifications()
    const setOnboardingPermissionsCompleted = usePreferencesStore(
        (s) => s.setOnboardingPermissionsCompleted,
    )
    const [status, setStatus] = React.useState<Notifications.PermissionStatus | "unknown">(
        "unknown",
    )
    const [loading, setLoading] = React.useState(false)

    // Guard: ensure we only navigate once from this screen
    const navigatedRef = React.useRef(false)
    const safeNavigateToTabs = React.useCallback(() => {
        if (navigatedRef.current) return
        navigatedRef.current = true
        setOnboardingPermissionsCompleted(true)
        router.replace("/(tabs)/moments")
    }, [router, setOnboardingPermissionsCompleted])

    // Refresh local permission status on focus
    useFocusEffect(
        React.useCallback(() => {
            let mounted = true
            ;(async () => {
                try {
                    const perm = await Notifications.getPermissionsAsync()
                    if (!mounted) return
                    setStatus(perm.status)
                    // If already granted, refresh token and go to app
                    if (perm.granted) {
                        setLoading(true)
                        await refresh()
                        safeNavigateToTabs()
                    }
                } catch {
                    // noop
                } finally {
                    if (mounted) setLoading(false)
                }
            })()
            return () => {
                mounted = false
            }
        }, [refresh, safeNavigateToTabs]),
    )

    const handleAllow = async () => {
        try {
            setLoading(true)
            const result = await Notifications.requestPermissionsAsync()
            setStatus(result.status)
            // Regardless of the outcome, attempt to refresh so we persist permission
            // and, if granted, fetch and sync the Expo push token.
            await refresh()
        } catch {
            // noop
        } finally {
            setLoading(false)
            // Proceed to the app after the request flow
            safeNavigateToTabs()
        }
    }

    const isGranted = status === "granted"

    return (
        <View
            style={[
                styles.container,
                {
                    gap: 40,
                },
            ]}
        >
            <LinearGradient
                renderToHardwareTextureAndroid
                colors={["#00000000", "#c29eff"]}
                style={styles.gradient}
            />

            <Image
                resizeMode="contain"
                priority="high"
                source={require("@/assets/images/illustrations/tutorial-push-notification-01.png")}
                style={{
                    width: sizes.screens.width * 1.2,
                    height: 230,
                }}
            />

            <Text style={styles.primaryBtnText}>
                Enable push notifications so you don’t miss new interactions, updates, and nearby
                moments tailored for you.
            </Text>
            <Text style={styles.hint}>We only send relevant notifications.</Text>

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
                    style={{ paddingHorizontal: 70, opacity: loading ? 0.8 : 1 }}
                >
                    <Text style={styles.primaryBtnText}>{"Finish"}</Text>
                </ButtonStandart>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: sizes.screens.height * 0.1,
        backgroundColor: colors.gray.black,
        alignItems: "center",
    },
    primaryBtnText: {
        color: colors.gray.white,
        fontSize: fonts.size.body * 1.4,
        fontFamily: fonts.family["ExtraBold"],
        fontStyle: "italic",
    } as TextStyle,
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
        color: colors.gray.grey_01 + "99",
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
