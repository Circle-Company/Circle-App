import React from "react"
import { Platform, Pressable, StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"

import { colors } from "@/constants/colors"
import { useCameraContext } from "../context"

const SIZE = 50
const ICON_SIZE = 28

export function FlashButton() {
    const { torch, setTorch, cameraPosition, isRecording, isSharing, isHandsFree } =
        useCameraContext()

    // Snapshot the user's torch preference the moment we enter a share so we
    // can restore it once the share ends. During the share itself we force
    // the torch off — nothing is being recorded, so keeping the LED on just
    // drains battery. The ref lives across mounts so a re-render mid-share
    // doesn't lose the saved state.
    const savedTorchRef = React.useRef<"off" | "on" | null>(null)
    React.useEffect(() => {
        if (isSharing) {
            if (savedTorchRef.current === null) {
                savedTorchRef.current = torch
                if (torch === "on") setTorch("off")
            }
        } else if (savedTorchRef.current !== null) {
            setTorch(savedTorchRef.current)
            savedTorchRef.current = null
        }
        // Intentionally not depending on `torch` — we only snapshot once at
        // the transition into isSharing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSharing])

    const isFront = cameraPosition === "front"
    // Flash can't be turned on mid-recording during press-and-hold (iOS
    // keeps the torch state locked once AVCaptureSession is running a
    // video output). In hands-free mode the flow is different — the user
    // may set the phone down and want to reach over to toggle the torch,
    // so we keep the button interactive during recording there.
    const hideDuringRecording = isRecording && torch === "off" && !isHandsFree
    const disabled = isFront || isSharing

    const useGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const toggleTorch = () => {
        if (!disabled) {
            setTorch(torch === "off" ? "on" : "off")
        }
    }

    // Placeholder must include the SAME horizontal margin the real button
    // uses (see styles.circle). Otherwise the row's justifyContent="center"
    // shifts the CaptureButton to the right by half the missing margin
    // when Flash hides itself.
    if (isFront || hideDuringRecording) return <View style={styles.placeholder} />

    const iconTint = torch === "on" ? colors.yellow.yellow_05 : colors.gray.white
    const Icon = (
        <SymbolView
            name={torch === "on" ? "flashlight.on.fill" : "flashlight.off.fill"}
            tintColor={iconTint}
            size={ICON_SIZE}
        />
    )

    if (useGlass) {
        return (
            <GlassView
                style={[styles.circle, disabled && styles.disabled]}
                glassEffectStyle="regular"
                colorScheme="dark"
                isInteractive
            >
                <Pressable style={styles.pressable} onPress={toggleTorch} disabled={disabled}>
                    {Icon}
                </Pressable>
            </GlassView>
        )
    }

    return (
        <View style={[styles.circle, styles.fallbackShell, disabled && styles.disabled]}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.fallbackBorder} pointerEvents="none" />
            <Pressable style={styles.pressable} onPress={toggleTorch} disabled={disabled}>
                {Icon}
            </Pressable>
        </View>
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
    disabled: {
        opacity: 0.4,
    },
    placeholder: {
        width: SIZE,
        marginHorizontal: 8,
    },
})
