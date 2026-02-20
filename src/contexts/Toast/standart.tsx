import React from "react"
import { Platform, View } from "react-native"
import { Text } from "../../components/Themed"
import fonts from "../../constants/fonts"
import sizes from "../../constants/sizes"
import type { TextStyle, ViewStyle } from "react-native"
import {
    GlassContainer,
    GlassView,
    isLiquidGlassAvailable,
    isGlassEffectAPIAvailable,
} from "expo-glass-effect"
import { colors } from "@/constants/colors"

type CustomToastProps = {
    title: string
    tint?: string
}

function hexToRgba(input: string, alpha: number): string {
    if (!input) return `rgba(255,255,255,${alpha})`

    const hex = input.trim()

    // #RGB
    const shortHex = /^#?([a-fA-F0-9]{3})$/
    // #RRGGBB
    const longHex = /^#?([a-fA-F0-9]{6})$/
    // rgba()/rgb()
    const rgbLike = /^rgba?\((.+)\)$/

    if (shortHex.test(hex)) {
        const [, h] = hex.match(shortHex) || []
        const r = parseInt(h[0] + h[0], 16)
        const g = parseInt(h[1] + h[1], 16)
        const b = parseInt(h[2] + h[2], 16)
        return `rgba(${r},${g},${b},${alpha})`
    }

    if (longHex.test(hex)) {
        const [, h] = hex.match(longHex) || []
        const r = parseInt(h.slice(0, 2), 16)
        const g = parseInt(h.slice(2, 4), 16)
        const b = parseInt(h.slice(4, 6), 16)
        return `rgba(${r},${g},${b},${alpha})`
    }

    if (rgbLike.test(hex)) {
        const [, body] = hex.match(rgbLike) || []
        const parts = body.split(",").map((p) => p.trim())
        const [r, g, b] = parts
        return `rgba(${r},${g},${b},${alpha})`
    }

    // Fallback to a subtle white-ish glass
    return `rgba(255,255,255,${alpha})`
}

export function Toast({ title, tint }: CustomToastProps) {
    // Determine if we should use native glass effect
    const shouldUseGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const baseContainer: ViewStyle = {
        width: sizes.screens.width * 0.9,
        minHeight: 56,
        borderRadius: 56 / 2,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignSelf: "center",
    }

    // Fallback "glass-like" style for platforms/devices without the Glass API
    const fallbackStyle: ViewStyle = {
        ...baseContainer,
        backgroundColor: colors.gray.grey_09,
    }

    const titleStyle: TextStyle = {
        fontSize: fonts.size.body * 1.1,
        fontFamily: fonts.family["Bold-Italic"],
        textAlign: "center",
        fontStyle: "italic",
        color: tint,
    }

    if (!shouldUseGlass) {
        // Render a styled View fallback when native Glass effect isn't available
        return (
            <View style={fallbackStyle}>
                <Text style={titleStyle}>{title}</Text>
            </View>
        )
    }

    // Native Glass on supported iOS
    return (
        <GlassContainer spacing={10}>
            <GlassView
                style={baseContainer}
                glassEffectStyle="regular"
                isInteractive={false}
                tintColor={colors.gray.grey_09 + 90}
            >
                <Text style={titleStyle}>{title}</Text>
            </GlassView>
        </GlassContainer>
    )
}
