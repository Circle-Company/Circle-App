import { StyleSheet, Text, View } from "react-native"

import ErrorIcon from "@/assets/icons/svgs/exclamationmark_icloud_fill.svg"
import React from "react"
import { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import fonts from "@/constants/fonts"

export interface VideoErrorProps {
    message: string
    onRetry?: () => void
}

export default function MidiaRenderVideoError({ message, onRetry }: VideoErrorProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <ErrorIcon width={40} height={40} fill={colors.gray.grey_05} />
            </View>
            <Text style={styles.errorText}>{message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        borderRadius: sizes.borderRadius["1md"],
        justifyContent: "center",
        padding: sizes.paddings["1md"],
        width: "80%",
    },
    errorText: {
        color: colors.gray.grey_05,
        fontSize: 11,
        textAlign: "center",
        fontFamily: fonts.family.ExtraBold,
    },
    iconContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
})
