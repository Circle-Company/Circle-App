import React from "react"
import { Pressable, StyleSheet, Text, View, ViewStyle, Platform } from "react-native"
import ChevronRight from "@/assets/icons/svgs/chevron_right.svg"
import fonts from "@/constants/fonts"

type HeaderBackButtonProps = {
    tintColor?: string
    pressColor?: string
    pressOpacity?: number
    displayMode?: "default" | "minimal" | "generic"
    label?: string
    onPress?: () => void
    disabled?: boolean
    testID?: string
}

export function HeaderBackButton({
    tintColor = "#fff",
    pressColor,
    pressOpacity = 0.6,
    displayMode = Platform.OS === "ios" ? "default" : "minimal",
    label = "Back",
    onPress,
    disabled,
    testID,
}: HeaderBackButtonProps) {
    const showLabel = displayMode === "default"
    return (
        <Pressable
            testID={testID}
            disabled={disabled}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label && label !== "Back" ? `${label}, back` : "Go back"}
            android_ripple={pressColor ? { color: pressColor, borderless: true } : undefined}
            style={({ pressed }) => [
                styles.backContainer,
                pressed && Platform.OS === "ios" ? { opacity: pressOpacity } : null,
            ]}
        >
            <ChevronRight
                width={13}
                height={21}
                fill={tintColor}
                style={styles.backIcon}
            />
            {showLabel && label ? (
                <Text
                    numberOfLines={1}
                    style={[styles.backLabel, { color: tintColor, fontFamily: fonts.family.Regular }]}
                >
                    {label}
                </Text>
            ) : null}
        </Pressable>
    )
}

type HeaderButtonProps = {
    tintColor?: string
    pressColor?: string
    pressOpacity?: number
    style?: ViewStyle | ViewStyle[]
    children?: React.ReactNode
    onPress?: () => void
    disabled?: boolean
    testID?: string
    accessibilityLabel?: string
}

export function HeaderButton({
    tintColor,
    pressColor,
    pressOpacity = 0.6,
    style,
    children,
    onPress,
    disabled,
    testID,
    accessibilityLabel,
}: HeaderButtonProps) {
    return (
        <Pressable
            testID={testID}
            disabled={disabled}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            android_ripple={pressColor ? { color: pressColor, borderless: true } : undefined}
            style={({ pressed }) => [
                styles.buttonContainer,
                pressed && Platform.OS === "ios" ? { opacity: pressOpacity } : null,
                style as ViewStyle,
            ]}
        >
            {children}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    backContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 0,
        minWidth: StyleSheet.hairlineWidth,
    },
    backIcon: {
        transform: [{ scaleX: -1 }],
        marginEnd: 6,
    },
    backLabel: {
        fontSize: 17,
        letterSpacing: 0.35,
    },
    buttonContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
        minWidth: 44,
        minHeight: 44,
    },
})
