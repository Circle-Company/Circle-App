import React from "react"
import { StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import Reanimated, { AnimatedStyle } from "react-native-reanimated"

import { HStack, Host, Text as SwiftText } from "@expo/ui/swift-ui"
import { font, foregroundStyle, glassEffect, padding } from "@expo/ui/swift-ui/modifiers"

import { iOSMajorVersion } from "@/lib/platform/detection"

interface Props {
    /**
     * Reanimated style (opacity + translateX) driven by the parent so both
     * this chip and ZoomIndicator can share a symmetric centering behaviour.
     */
    animatedStyle: AnimatedStyle<any>
}

const LABEL = "⚡ Flash on"

/**
 * Flash-on chip that overlays the top-center of the camera preview. Same
 * liquid-glass recipe as `ZoomIndicator`. Visibility + horizontal offset
 * come from `animatedStyle`, controlled by the parent — that way the flash
 * chip slides left when the zoom chip needs to sit to its right, keeping
 * both pill capsules balanced around the center line.
 */
export function FlashIndicator({ animatedStyle }: Props): React.ReactElement {
    if (iOSMajorVersion != null && iOSMajorVersion >= 26) {
        return (
            <Reanimated.View pointerEvents="none" style={[styles.position, animatedStyle]}>
                <Host colorScheme="dark" matchContents>
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
                            {LABEL}
                        </SwiftText>
                    </HStack>
                </Host>
            </Reanimated.View>
        )
    }

    return (
        <Reanimated.View pointerEvents="none" style={[styles.fallbackPill, animatedStyle]}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.fallbackBorder} />
            <Reanimated.Text style={styles.fallbackText}>{LABEL}</Reanimated.Text>
        </Reanimated.View>
    )
}

const styles = StyleSheet.create({
    position: {
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
    },
})
