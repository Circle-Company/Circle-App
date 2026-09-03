import React from "react"
import { Platform, StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"
import Reanimated, {
    cancelAnimation,
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"

const AnimatedGlassView = Reanimated.createAnimatedComponent(GlassView)

const VISIBLE_DURATION_MS = 2600
const FADE_MS = 200

interface Props {
    /**
     * Increment this to (re)show the hint. Each new value > 0 fades the chip
     * in, holds it for VISIBLE_DURATION_MS, then fades it out.
     */
    trigger: number
    /** Text next to the hand icon. Caller is responsible for translation. */
    label: string
}

/**
 * Transient hint chip. Same visual language as `FlipCameraHint`: native iOS
 * 26 liquid glass via `expo-glass-effect`, BlurView-based glass on older
 * iOS. Used for two prompts today:
 *
 *   - Hands-free hold hint  → "Free hands on, touch to record"
 *   - Short-clip hint       → "Aperte e segure para gravar"
 */
export function HandsFreeHint({ trigger, label }: Props): React.ReactElement | null {

    const [mounted, setMounted] = React.useState(false)
    const opacity = useSharedValue(0)
    const translateY = useSharedValue(6)

    const useGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const hideTimerRef = React.useRef<NodeJS.Timeout | null>(null)

    const teardown = React.useCallback(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current)
            hideTimerRef.current = null
        }
        cancelAnimation(opacity)
        cancelAnimation(translateY)
        opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
            "worklet"
            if (finished) runOnJS(setMounted)(false)
        })
    }, [opacity, translateY])

    React.useEffect(() => {
        if (trigger <= 0) return

        setMounted(true)
        cancelAnimation(opacity)
        cancelAnimation(translateY)
        opacity.value = withTiming(1, { duration: FADE_MS })
        translateY.value = withTiming(0, { duration: FADE_MS, easing: Easing.out(Easing.quad) })

        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        hideTimerRef.current = setTimeout(teardown, VISIBLE_DURATION_MS)

        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current)
                hideTimerRef.current = null
            }
        }
    }, [trigger, opacity, translateY, teardown])

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }))

    if (!mounted) return null

    const InnerRow = (
        <View style={styles.row}>
            <SymbolView
                name="hand.tap.fill"
                tintColor={colors.gray.white}
                size={14}
                weight="bold"
            />
            <Reanimated.Text style={styles.label}>{label}</Reanimated.Text>
        </View>
    )

    if (useGlass) {
        return (
            <AnimatedGlassView
                colorScheme="dark"
                pointerEvents="none"
                style={[styles.pill, containerStyle]}
                glassEffectStyle="regular"
                colorScheme="dark"
                // Same recipe as ZoomIndicator: without a tint the glass
                // fails to sample the AVCaptureVideoPreviewLayer behind it
                // and often ends up invisible. `isInteractive` bumps the
                // effect's visibility to match iOS UI controls.
                tintColor="rgba(0, 0, 0, 0.35)"
                isInteractive
            >
                {InnerRow}
            </AnimatedGlassView>
        )
    }

    return (
        <Reanimated.View
            pointerEvents="none"
            style={[styles.pill, styles.fallbackShell, containerStyle]}
        >
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.fallbackBorder} pointerEvents="none" />
            {InnerRow}
        </Reanimated.View>
    )
}

const HINT_RADIUS = 999

const styles = StyleSheet.create({
    pill: {
        borderRadius: HINT_RADIUS,
        overflow: "hidden",
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
        borderRadius: HINT_RADIUS,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255, 255, 255, 0.28)",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    label: {
        color: colors.gray.white,
        fontSize: 13,
        fontFamily: fonts.family.Medium,
        letterSpacing: 0.2,
    },
})
