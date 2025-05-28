import { StyleSheet, Text, View } from "react-native"

import ErrorIcon from "@/assets/icons/svgs/exclamationmark_icloud_fill.svg"
import React from "react"
import { colors } from "@/layout/constants/colors"
import sizes from "@/layout/constants/sizes"

export interface VideoErrorProps {
    message: string;
    onRetry?: () => void;
}

export default function MidiaRenderVideoError({ message, onRetry }: VideoErrorProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <ErrorIcon width={24} height={24} fill={colors.gray.white} />
            </View>
            <Text style={styles.errorText}>{message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: sizes.borderRadius["1md"],
        justifyContent: "center",
        padding: sizes.paddings["1md"],
        width: "80%",
    },
    errorText: {
        color: colors.gray.white,
        fontSize: 14,
        marginTop: sizes.margins["2sm"],
        textAlign: "center",
    },
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: sizes.margins["2sm"],
    }
})   