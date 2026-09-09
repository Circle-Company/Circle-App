import React from "react"
import { Platform, Pressable, StyleSheet, Text, View } from "react-native"
import { BlurView } from "expo-blur"
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"
import Reanimated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"

import { colors } from "@/constants/colors"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { useCameraContext } from "../context"

const AnimatedGlassView = Reanimated.createAnimatedComponent(GlassView)

const OFF_WIDTH = 45
const ON_WIDTH = 155
const HEIGHT = 45
const ICON_SIZE = 22
const LABEL_ON = "Free hands on"
const LABEL_OFF = "Free hands off"
const TRANSITION_MS = 260
// How long the label lingers after activation before the pill collapses
// back to a compact icon. Mode itself stays on — only the label retracts.
const LABEL_HOLD_MS = 2200

/**
 * Toggle for hands-free capture mode. Sits at the top-right of the camera
 * preview.
 *
 * Off → compact circle (icon only, gray).
 * On  → pill briefly expands with "Free hands on" label, then collapses
 *       back to a compact yellow-icon circle (mode still active).
 * When the user taps to deactivate: pill re-expands with "Free hands off"
 * for the same hold duration, then collapses fully.
 *
 * Locked during recording so the user can't switch modes mid-shot.
 */
export function HandsFreeToggle(): React.ReactElement {
    const { isHandsFree, setIsHandsFree, isRecording } = useCameraContext()

    const disabled = isRecording
    const useGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    // Transient "expanded" state independent of the mode. Every transition
    // (off → on OR on → off) briefly expands the pill with a confirmation
    // label, then collapses back to the compact icon-only form.
    const [labelExpanded, setLabelExpanded] = React.useState(false)
    const collapseTimerRef = React.useRef<NodeJS.Timeout | null>(null)
    const isFirstMountRef = React.useRef(true)

    React.useEffect(() => {
        // Skip the initial mount so the pill doesn't open by itself when
        // the camera screen first renders.
        if (isFirstMountRef.current) {
            isFirstMountRef.current = false
            return
        }
        if (collapseTimerRef.current) {
            clearTimeout(collapseTimerRef.current)
            collapseTimerRef.current = null
        }
        setLabelExpanded(true)
        collapseTimerRef.current = setTimeout(() => {
            setLabelExpanded(false)
            collapseTimerRef.current = null
        }, LABEL_HOLD_MS)
        return () => {
            if (collapseTimerRef.current) {
                clearTimeout(collapseTimerRef.current)
                collapseTimerRef.current = null
            }
        }
    }, [isHandsFree])

    const width = useSharedValue(labelExpanded ? ON_WIDTH : OFF_WIDTH)
    React.useEffect(() => {
        width.value = withTiming(labelExpanded ? ON_WIDTH : OFF_WIDTH, {
            duration: TRANSITION_MS,
            easing: Easing.out(Easing.cubic),
        })
    }, [labelExpanded, width])

    const containerStyle = useAnimatedStyle(() => ({
        width: width.value,
    }))
    const labelStyle = useAnimatedStyle(() => ({
        opacity: interpolate(width.value, [OFF_WIDTH + 20, ON_WIDTH], [0, 1], "clamp"),
    }))

    const onPress = () => {
        if (disabled) return
        // Distinct haptics per direction: heavier "impactMedium" confirms
        // activating the lock; lighter "impactLight" for turning it off so
        // the two toggles feel semantically different in the hand.
        Vibrate(isHandsFree ? "impactLight" : "impactMedium")
        setIsHandsFree(!isHandsFree)
    }

    const iconName = isHandsFree ? "hand.raised.fill" : "hand.raised"
    const iconColor = isHandsFree ? colors.yellow.yellow_04 : colors.gray.white + "90"

    const Content = (
        <Pressable style={styles.pressable} onPress={onPress} disabled={disabled}>
            <View style={styles.row} pointerEvents="none">
                <SymbolView name={iconName} tintColor={iconColor} size={ICON_SIZE} />
                <Reanimated.View style={labelStyle}>
                    <Text style={styles.label} numberOfLines={1}>
                        {isHandsFree ? LABEL_ON : LABEL_OFF}
                    </Text>
                </Reanimated.View>
            </View>
        </Pressable>
    )

    if (useGlass) {
        return (
            <AnimatedGlassView
                style={[styles.wrap, containerStyle, disabled && styles.disabled]}
                glassEffectStyle="regular"
                colorScheme="dark"
                isInteractive
            >
                {Content}
            </AnimatedGlassView>
        )
    }

    return (
        <Reanimated.View
            style={[styles.wrap, styles.fallbackShell, containerStyle, disabled && styles.disabled]}
        >
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.fallbackBorder} pointerEvents="none" />
            {Content}
        </Reanimated.View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        position: "absolute",
        top: 16,
        right: 16,
        height: HEIGHT,
        borderRadius: HEIGHT / 2,
        overflow: "hidden",
        zIndex: 20,
    },
    fallbackShell: {
        backgroundColor: "rgba(20, 20, 20, 0.18)",
    },
    fallbackBorder: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: HEIGHT / 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255, 255, 255, 0.28)",
    },
    pressable: {
        flex: 1,
        justifyContent: "center",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 12,
        paddingRight: 12,
    },
    label: {
        marginLeft: 6,
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    disabled: {
        opacity: 0.4,
    },
})
