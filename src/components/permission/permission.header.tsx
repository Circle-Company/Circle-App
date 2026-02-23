import React from "react"
import { StyleSheet, View } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { Host, Slider, LinearProgress } from "@expo/ui/swift-ui"

export type PermissionHeaderProps = {
    // New API
    completed?: number
    total?: number
    remaining?: number
    // Legacy API (kept for backward compatibility with callers)
    currentStep?: number
    totalSteps?: number
    title?: string
    lead?: string
}

export default function PermissionHeader({
    // New API
    completed,
    total,
    remaining,
    // Legacy API
    currentStep,
    totalSteps,
    title = "Setup your app",
    lead = "Circle App need some permissions to provide best experience for you",
}: PermissionHeaderProps) {
    // Resolve totals from new or legacy props
    const rawTotal =
        typeof total === "number" ? total : typeof totalSteps === "number" ? totalSteps : 1
    const safeTotal = Math.max(1, Number.isFinite(rawTotal) ? rawTotal : 1)

    // Resolve completed steps:
    // - Prefer `completed` (new API)
    // - Fallback: derive from legacy `currentStep` (1-based ordinal => completed = currentStep - 1)
    const legacyCurrent = typeof currentStep === "number" ? currentStep : undefined
    const rawCompleted =
        typeof completed === "number"
            ? completed
            : legacyCurrent !== undefined
              ? Math.max(0, legacyCurrent - 1)
              : 0
    const safeCompleted = Math.min(
        Math.max(0, Number.isFinite(rawCompleted) ? rawCompleted : 0),
        safeTotal,
    )

    // Remaining: prefer provided prop; else compute from completed/total
    const computedRemaining = Math.max(0, safeTotal - safeCompleted)
    const safeRemaining =
        typeof remaining === "number" && Number.isFinite(remaining)
            ? Math.max(0, Math.min(remaining, safeTotal))
            : computedRemaining

    // Progress is the completed fraction
    const progressRatio = safeTotal > 0 ? Math.min(Math.max(0, safeCompleted / safeTotal), 1) : 0

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
                {safeRemaining > 0
                    ? `Just more ${safeRemaining} ${safeRemaining === 1 ? "step" : "steps"} and done ✨`
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
        width: sizes.screens.width * 0.7,
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
