import React from "react"
import { StyleSheet, View } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { Host, Slider, LinearProgress } from "@expo/ui/swift-ui"

export type PermissionHeaderProps = {
    currentStep: number
    totalSteps: number
    title?: string
    lead?: string
}

export default function PermissionHeader({
    currentStep,
    totalSteps,
    title = "Setup your App",
    lead = "Circle App need some permissions to provide best experience for you",
}: PermissionHeaderProps) {
    const safeTotal = Math.max(1, Number.isFinite(totalSteps) ? totalSteps : 1)
    const safeCurrent = Math.min(
        Math.max(1, Number.isFinite(currentStep) ? currentStep : 1),
        safeTotal,
    )
    const progressRatio = Math.min(Math.max(0, 1 - safeCurrent / safeTotal), 1)
    const remaining = Math.max(0, safeTotal - safeCurrent)

    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerLead}>{lead}</Text>

            <View style={styles.progressContainer}>
                <Host matchContents>
                    <LinearProgress
                        frame={{ width: sizes.screens.width - sizes.paddings["1md"] * 2 }}
                        color={colors.purple.purple_01}
                        progress={progressRatio}
                    />
                </Host>
            </View>

            <Text style={styles.progressText}>
                {remaining > 0
                    ? `Just more ${remaining} ${remaining === 1 ? "tap" : "taps"} and done ✨`
                    : "You're all set ✨"}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        alignItems: "center",
        marginTop: sizes.screens.height * 0.05,
        marginBottom: sizes.margins["3sm"],
        paddingTop: sizes.margins["3sm"],
        paddingBottom: sizes.margins["2sm"],
        paddingHorizontal: sizes.paddings["1md"],
    },
    headerTitle: {
        fontSize: Fonts.size.title1 * 1.1,
        color: colors.gray.white,
        fontFamily: Fonts.family["Black-Italic"],
        marginBottom: sizes.margins["1sm"],
        textAlign: "center",
    },
    headerLead: {
        marginTop: sizes.margins["1sm"],
        fontSize: Fonts.size.body * 0.9,
        color: colors.gray.grey_04,
        fontFamily: Fonts.family.Medium,
        textAlign: "center",
    },
    progressContainer: {
        marginTop: sizes.margins["2md"],
        marginBottom: sizes.margins["1md"],
    },
    progressText: {
        color: colors.gray.grey_04,
        fontStyle: "italic",
        fontSize: Fonts.size.body * 1.1,
        fontFamily: Fonts.family.Medium,
    },
})
