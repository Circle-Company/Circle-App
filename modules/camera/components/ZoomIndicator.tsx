import React from "react"
import { StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import Reanimated, { AnimatedStyle } from "react-native-reanimated"

import { HStack, Host, Text as SwiftText } from "@expo/ui/swift-ui"
import { font, foregroundStyle, glassEffect, padding } from "@expo/ui/swift-ui/modifiers"

import { iOSMajorVersion } from "@/lib/platform/detection"

interface Props {
    /** Current zoom label, e.g. "1.5x". */
    text: string
    /**
     * Reanimated style (usually just `opacity`) supplied by the parent so
     * the indicator can fade in/out with the pinch/pan gesture without the
     * caller having to know how this component is built inside.
     */
    animatedStyle: AnimatedStyle<any>
}

/**
 * Zoom level chip that overlays the top-center of the camera preview.
 *
 * iOS 26+  → real SwiftUI liquid-glass capsule via `@expo/ui`'s
 *            `glassEffect` modifier. Text is a SwiftUI `Text` so it inherits
 *            the native glass rendering and light-adaptation.
 * iOS <26  → fallback stack that approximates the look with BlurView +
 *            top-highlight gradient + hairline rim border, matching what the
 *            FlipCameraHint uses.
 *
 * Both paths are wrapped in the same Reanimated.View so the caller-supplied
 * `animatedStyle` (opacity fade) works uniformly.
 */
export function ZoomIndicator({ text, animatedStyle }: Props): React.ReactElement {
    if (iOSMajorVersion != null && iOSMajorVersion >= 26) {
        return (
            <Reanimated.View pointerEvents="none" style={[styles.hostPosition, animatedStyle]}>
                <Host matchContents>
                    <HStack
                        modifiers={[
                            padding({ horizontal: 12, vertical: 6 }),
                            glassEffect({
                                glass: { variant: "regular" },
                                shape: "capsule",
                            }),
                        ]}
                    >
                        <SwiftText
                            modifiers={[
                                font({ size: 14, weight: "semibold", design: "rounded" }),
                                foregroundStyle("#FFFFFF"),
                            ]}
                        >
                            {text}
                        </SwiftText>
                    </HStack>
                </Host>
            </Reanimated.View>
        )
    }

    // Fallback: fake glass for iOS < 26 where the real liquid glass API
    // isn't available. Matches the FlipCameraHint recipe so both chips look
    // like siblings from the same design system.
    return (
        <Reanimated.View pointerEvents="none" style={[styles.fallbackPill, animatedStyle]}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.fallbackBorder} />
            <Reanimated.Text style={styles.fallbackText}>{text}</Reanimated.Text>
        </Reanimated.View>
    )
}

const styles = StyleSheet.create({
    // iOS 26 path — Host sizes itself via `matchContents`; we only supply
    // position. No background/border here: the glass is native.
    hostPosition: {
        position: "absolute",
        top: 16,
        alignSelf: "center",
        zIndex: 20,
    },
    fallbackPill: {
        position: "absolute",
        top: 16,
        alignSelf: "center",
        borderRadius: 999,
        overflow: "hidden",
        backgroundColor: "rgba(20, 20, 20, 0.18)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        zIndex: 20,
    },
    fallbackBorder: {
        // Literal instead of `...StyleSheet.absoluteFillObject` — RN 0.85
        // removed that property from the TS typings; `absoluteFill` is
        // still there but it's a stylesheet id (number) and can't be spread.
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255, 255, 255, 0.28)",
    },
    fallbackText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
        fontVariant: ["tabular-nums"],
    },
})
