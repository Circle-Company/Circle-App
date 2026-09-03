import React from "react"
import { StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import { SymbolView } from "expo-symbols"
import Reanimated, {
    cancelAnimation,
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated"

import { HStack, Host, Image as SwiftImage, Text as SwiftText } from "@expo/ui/swift-ui"
import {
    font,
    foregroundStyle,
    glassEffect,
    padding,
    symbolEffect,
} from "@expo/ui/swift-ui/modifiers"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { useCameraContext } from "../context"

// Per-direction session flags. The hint teaches two distinct gestures:
//   - Back → Front: drag left  ("Drag to flip")
//   - Front → Back: drag right ("Drag back to return")
// Each shows at most once per app session; the second one appears the first
// time the user actually flips to the front camera during a recording.
let LEFT_HINT_SHOWN_THIS_SESSION = false
let RIGHT_HINT_SHOWN_THIS_SESSION = false

const APPEAR_DELAY_MS = 600
const VISIBLE_DURATION_MS = 3500
const FADE_MS = 220

interface Props {
    /**
     * Drive from CameraContext.isRecording (true while a hold-to-record
     * gesture is active). The hint is meaningful only during a hold because
     * that's the only window where the swipe-flip works.
     */
    isRecording: boolean
}

type Direction = "left" | "right"

/**
 * Tutorial chip that teaches the "drag horizontally while holding the capture
 * button to flip the camera" gesture. Direction adapts to the current camera:
 *   - Back camera  → hint points LEFT  (drag left to flip to the front)
 *   - Front camera → hint points RIGHT (drag right to return to the back)
 *
 * Each direction shows at most once per app session so the second gesture
 * is taught the first time the user actually reaches the front camera.
 *
 * iOS 26+ renders as a real SwiftUI liquid-glass capsule via `@expo/ui`
 * `glassEffect` + `symbolEffect(wiggle)` for the native SF Symbol nudge.
 * Older iOS falls back to a BlurView + gradient + hairline-rim faux glass
 * with a Reanimated translateX loop for the chevron pulse.
 */
export function FlipCameraHint({ isRecording }: Props): React.ReactElement | null {
    const { t } = React.useContext(LanguageContext)
    const { cameraPosition } = useCameraContext()

    const [mounted, setMounted] = React.useState(false)
    const [direction, setDirection] = React.useState<Direction>("left")

    const opacity = useSharedValue(0)
    const containerTranslateY = useSharedValue(6)
    // Only used on the fallback (< iOS 26) path — SwiftUI symbolEffect wiggle
    // handles the pulse on the real-glass path.
    const arrowTranslateX = useSharedValue(0)

    const hideTimerRef = React.useRef<NodeJS.Timeout | null>(null)

    const runArrowLoop = React.useCallback(
        (dir: Direction) => {
            cancelAnimation(arrowTranslateX)
            arrowTranslateX.value = 0
            const peak = dir === "left" ? -10 : 10
            arrowTranslateX.value = withRepeat(
                withSequence(
                    withTiming(peak, { duration: 500, easing: Easing.inOut(Easing.quad) }),
                    withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) }),
                ),
                -1,
                false,
            )
        },
        [arrowTranslateX],
    )

    const teardown = React.useCallback(() => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current)
            hideTimerRef.current = null
        }
        cancelAnimation(arrowTranslateX)
        cancelAnimation(opacity)
        cancelAnimation(containerTranslateY)
        opacity.value = withTiming(0, { duration: FADE_MS }, (finished) => {
            "worklet"
            if (finished) runOnJS(setMounted)(false)
        })
    }, [opacity, containerTranslateY, arrowTranslateX])

    React.useEffect(() => {
        if (!isRecording) {
            if (mounted) teardown()
            return
        }

        const wantsDirection: Direction = cameraPosition === "front" ? "right" : "left"
        const alreadyShown =
            wantsDirection === "left" ? LEFT_HINT_SHOWN_THIS_SESSION : RIGHT_HINT_SHOWN_THIS_SESSION

        if (mounted) {
            if (direction !== wantsDirection) {
                setDirection(wantsDirection)
                runArrowLoop(wantsDirection)
                if (wantsDirection === "left") LEFT_HINT_SHOWN_THIS_SESSION = true
                else RIGHT_HINT_SHOWN_THIS_SESSION = true
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
                hideTimerRef.current = setTimeout(teardown, VISIBLE_DURATION_MS)
            }
            return
        }

        if (alreadyShown) return

        if (wantsDirection === "left") LEFT_HINT_SHOWN_THIS_SESSION = true
        else RIGHT_HINT_SHOWN_THIS_SESSION = true

        setDirection(wantsDirection)
        setMounted(true)

        opacity.value = withDelay(APPEAR_DELAY_MS, withTiming(1, { duration: FADE_MS }))
        containerTranslateY.value = withDelay(
            APPEAR_DELAY_MS,
            withTiming(0, { duration: FADE_MS, easing: Easing.out(Easing.quad) }),
        )
        arrowTranslateX.value = withDelay(APPEAR_DELAY_MS, withTiming(0, { duration: 0 }))
        setTimeout(() => runArrowLoop(wantsDirection), APPEAR_DELAY_MS)

        hideTimerRef.current = setTimeout(teardown, APPEAR_DELAY_MS + VISIBLE_DURATION_MS)

        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current)
                hideTimerRef.current = null
            }
            cancelAnimation(arrowTranslateX)
        }
    }, [
        isRecording,
        cameraPosition,
        mounted,
        direction,
        teardown,
        runArrowLoop,
        opacity,
        containerTranslateY,
        arrowTranslateX,
    ])

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: containerTranslateY.value }],
    }))
    const arrowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: arrowTranslateX.value }],
    }))

    if (!mounted) return null

    const arrowIcon = direction === "left" ? "chevron.left" : "chevron.right"
    const labelText = direction === "left" ? t("Drag to flip") : t("Drag back to return")

    // iOS 26+: real SwiftUI liquid glass capsule. The chevron uses the native
    // `symbolEffect(wiggle)` for the directional nudge — no RN Reanimated on
    // this path, which is the only way to keep glyphs inside a real Host tree.
    if (iOSMajorVersion != null && iOSMajorVersion >= 26) {
        return (
            <Reanimated.View pointerEvents="none" style={containerStyle}>
                <Host colorScheme="dark" matchContents>
                    <HStack
                        spacing={8}
                        modifiers={[
                            padding({ horizontal: 14, vertical: 8 }),
                            glassEffect({
                                glass: { variant: "regular" },
                                shape: "capsule",
                            }),
                        ]}
                    >
                        {direction === "left" ? (
                            <>
                                <SwiftImage
                                    systemName={arrowIcon}
                                    color="#FFFFFF"
                                    size={14}
                                    modifiers={[
                                        symbolEffect(
                                            { effect: "wiggle", direction: "left" },
                                            { options: { repeat: "continuous" } },
                                        ),
                                    ]}
                                />
                                <SwiftText
                                    modifiers={[
                                        font({ size: 13, weight: "medium" }),
                                        foregroundStyle("#FFFFFF"),
                                    ]}
                                >
                                    {labelText}
                                </SwiftText>
                            </>
                        ) : (
                            <>
                                <SwiftText
                                    modifiers={[
                                        font({ size: 13, weight: "medium" }),
                                        foregroundStyle("#FFFFFF"),
                                    ]}
                                >
                                    {labelText}
                                </SwiftText>
                                <SwiftImage
                                    systemName={arrowIcon}
                                    color="#FFFFFF"
                                    size={14}
                                    modifiers={[
                                        symbolEffect(
                                            { effect: "wiggle", direction: "right" },
                                            { options: { repeat: "continuous" } },
                                        ),
                                    ]}
                                />
                            </>
                        )}
                    </HStack>
                </Host>
            </Reanimated.View>
        )
    }

    // Fallback: BlurView + hairline-rim pill for iOS < 26 where the real
    // glass API isn't available.
    return (
        <Reanimated.View pointerEvents="none" style={[styles.container, containerStyle]}>
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.border} pointerEvents="none" />
            <View style={styles.content}>
                {direction === "left" ? (
                    <>
                        <Reanimated.View style={arrowStyle}>
                            <SymbolView
                                name={arrowIcon}
                                tintColor={colors.gray.white}
                                size={14}
                                weight="bold"
                            />
                        </Reanimated.View>
                        <Reanimated.Text style={styles.label}>{labelText}</Reanimated.Text>
                    </>
                ) : (
                    <>
                        <Reanimated.Text style={styles.label}>{labelText}</Reanimated.Text>
                        <Reanimated.View style={arrowStyle}>
                            <SymbolView
                                name={arrowIcon}
                                tintColor={colors.gray.white}
                                size={14}
                                weight="bold"
                            />
                        </Reanimated.View>
                    </>
                )}
            </View>
        </Reanimated.View>
    )
}

const HINT_RADIUS = 999

const styles = StyleSheet.create({
    container: {
        borderRadius: HINT_RADIUS,
        overflow: "hidden",
        backgroundColor: "rgba(20, 20, 20, 0.18)",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    border: {
        // Literal instead of `...StyleSheet.absoluteFill` — `absoluteFill`
        // is a stylesheet id (number) in the RN 0.85 typings and cannot be
        // spread. `absoluteFillObject` was dropped from the same typings, so
        // the only safe form for a spread is the explicit properties.
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: HINT_RADIUS,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255, 255, 255, 0.28)",
    },
    label: {
        color: colors.gray.white,
        fontSize: 13,
        fontFamily: fonts.family.Medium,
        letterSpacing: 0.2,
    },
})
