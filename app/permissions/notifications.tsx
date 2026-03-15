import React from "react"
import { StyleSheet, View } from "react-native"
import { useRouter } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"

import { Text } from "@/components/Themed"
import ButtonStandart from "@/components/buttons/button-standart"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"
import fonts from "@/constants/fonts"

import useAppPermissions, { PermissionStatus } from "@/lib/hooks/useAppPermissions"

function isFinal(status: PermissionStatus) {
    return status === "granted" || status === "denied"
}

export default function NotificationsPermissionScreen() {
    const router = useRouter()
    const { items, refresh, requestOne } = useAppPermissions()
    const push = React.useMemo(() => items.find((i) => i.id === "pushNotifications"), [items])

    // Sempre checar status ao focar na tela
    useFocusEffect(
        React.useCallback(() => {
            let active = true
            ;(async () => {
                if (!active) return
                await refresh()
            })()
            return () => {
                active = false
            }
        }, [refresh]),
    )

    // Se já estiver concedida ou negada, segue para o app
    React.useEffect(() => {
        const status = push?.status ?? "unknown"
        if (isFinal(status)) {
            router.replace("/(tabs)/moments")
        }
    }, [push?.status, router])

    const handleAllow = React.useCallback(async () => {
        await requestOne("pushNotifications")
        await refresh()
        // O efeito acima cuida da navegação quando o status deixar de ser "unknown"
    }, [requestOne, refresh])

    const status = push?.status ?? "unknown"
    const canAsk =
        status === "unknown" || // iOS/Android estado "indeterminado"
        push?.canAskAgain // em alguns casos pode reapresentar diálogo

    return (
        <View style={styles.container}>
            <View style={{ alignItems: "center", gap: sizes.margins["1md"] }}>
                <Text style={styles.icon}>🔔</Text>
                <Text style={styles.title}>Enable Push Notifications</Text>
                <Text style={styles.subtitle}>
                    Stay up to date with new activity, messages and updates.
                </Text>
            </View>

            <View style={styles.ctaWrapper}>
                {canAsk ? (
                    <ButtonStandart
                        action={handleAllow}
                        backgroundColor={colors.purple.purple_04}
                        margins={false}
                        height={56}
                        animationScale={0.92}
                        style={{ paddingHorizontal: 60 }}
                    >
                        <Text style={styles.primaryBtnText}>Allow Notifications</Text>
                    </ButtonStandart>
                ) : (
                    <Text style={styles.info}>Checking your permission status...</Text>
                )}

                <Text style={styles.footerNote}>You can change this anytime in Settings</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: sizes.screens.height * 0.12,
        backgroundColor: colors.gray.black,
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: sizes.margins["1xl"] * 1.2,
    },
    icon: {
        fontSize: 72,
        textAlign: "center",
    },
    title: {
        color: colors.gray.white,
        fontSize: fonts.size.title3 * 1.1,
        fontFamily: fonts.family.ExtraBold,
        fontStyle: "italic",
        textAlign: "center",
    },
    subtitle: {
        color: colors.gray.grey_01 + "CC",
        fontSize: fonts.size.body * 1.0,
        fontFamily: fonts.family.Regular,
        textAlign: "center",
        width: sizes.screens.width * 0.74,
    },
    ctaWrapper: {
        width: "100%",
        alignItems: "center",
        gap: sizes.margins["1sm"],
    },
    primaryBtnText: {
        color: colors.gray.white,
        fontSize: fonts.size.body * 1.25,
        fontFamily: fonts.family.ExtraBold,
        fontStyle: "italic",
    },
    info: {
        color: colors.gray.grey_01,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Regular,
    },
    footerNote: {
        color: colors.gray.grey_04,
        fontSize: fonts.size.body * 0.95,
        fontFamily: fonts.family.Regular,
        textAlign: "center",
        marginTop: sizes.margins["1sm"],
    },
})
