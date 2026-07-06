import React, { useCallback } from "react"
import { Platform, Pressable, StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"
import Reanimated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"

import { colors } from "@/constants/colors"
import { useCameraContext } from "../context"

const AnimatedGlassView = Reanimated.createAnimatedComponent(GlassView)

const SIZE = 50
const ICON_SIZE = 26

// Quick squeeze-and-bounce pulse the glass container plays the moment the
// button fires, so the user sees clearly that their tap registered.
const PRESS_SCALE = 0.86
const SPRING_BACK = { damping: 7, stiffness: 240, mass: 0.6 } as const

export function RotateButton() {
    const { setCameraPosition, isSharing } = useCameraContext()
    const containerScale = useSharedValue(1)

    const useGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const triggerPulse = useCallback(() => {
        containerScale.value = withSequence(
            withTiming(PRESS_SCALE, { duration: 90 }),
            withSpring(1, SPRING_BACK),
        )
    }, [containerScale])

    const onFlipCameraPressed = useCallback(() => {
        if (isSharing) return
        triggerPulse()
        setCameraPosition((p) => (p === "back" ? "front" : "back"))
    }, [isSharing, setCameraPosition, triggerPulse])

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ scale: containerScale.value }],
        opacity: withTiming(isSharing ? 0.4 : 1, { duration: 180 }),
    }))

    const Icon = (
        <SymbolView
            name="arrow.triangle.2.circlepath"
            tintColor={colors.gray.white}
            size={ICON_SIZE}
        />
    )

    if (useGlass) {
        return (
            <AnimatedGlassView
                style={[styles.circle, containerStyle]}
                glassEffectStyle="regular"
                colorScheme="dark"
                isInteractive
            >
                <Pressable
                    style={styles.pressable}
                    onPress={onFlipCameraPressed}
                    disabled={isSharing}
                >
                    {Icon}
                </Pressable>
            </AnimatedGlassView>
        )
    }

    return (
        <Reanimated.View style={[styles.circle, styles.fallbackShell, containerStyle]}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.fallbackBorder} pointerEvents="none" />
            <Pressable style={styles.pressable} onPress={onFlipCameraPressed} disabled={isSharing}>
                {Icon}
            </Pressable>
        </Reanimated.View>
    )
}

const styles = StyleSheet.create({
    circle: {
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        overflow: "hidden",
        marginHorizontal: 8,
    },
    fallbackShell: {
        backgroundColor: "rgba(140, 140, 140, 0.3)",
    },
    fallbackBorder: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: SIZE / 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255, 255, 255, 0.28)",
    },
    pressable: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
})
