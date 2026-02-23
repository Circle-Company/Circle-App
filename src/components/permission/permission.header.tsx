import React from "react"
import { StyleSheet, View } from "react-native"
import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"

export type PermissionHeaderProps = {
    currentStep: number
    totalSteps: number
    title?: string
    lead?: string
}

export default function PermissionHeader({
    currentStep,
    totalSteps,
    title = "Allow Permissions",
    lead = "Circle App need some permissions to provide best experience for you",
}: PermissionHeaderProps) {
    const safeTotal = Math.max(1, Number.isFinite(totalSteps) ? totalSteps : 1)
    const safeCurrent = Math.min(
        Math.max(1, Number.isFinite(currentStep) ? currentStep : 1),
        safeTotal,
    )
    const progressRatio = Math.min(safeCurrent / safeTotal, 1)

    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerLead}>{lead}</Text>

            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>

            <Text style={styles.progressText}>
                Step {safeCurrent} of {safeTotal}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
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
        height: 8,
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
        marginTop: sizes.margins["1sm"],
        color: colors.gray.grey_04,
        fontStyle: "italic",
        fontSize: Fonts.size.footnote,
        fontFamily: Fonts.family.Medium,
    },
})
