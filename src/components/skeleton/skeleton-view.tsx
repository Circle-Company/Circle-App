import React from "react"
import {
    Platform,
    StyleSheet,
    View as RNView,
    ViewProps,
    UIManager,
    requireNativeComponent,
} from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated"
import { colors } from "../../constants/colors"
import sizes from "../../constants/sizes"
import { View } from "../Themed"

/**
 - iOS native (SwiftUI via expo-modules) + JS fallback Skeleton
 - If the native SwiftUI view is registered (ExpoSkeletonView), it is used on iOS.
 - Otherwise, falls back to the animated gradient implementation (cross‑platform).
*/

// ---------- Native iOS integration (SwiftUI via expo-modules) ----------
type NativeSkeletonProps = {
    // Native props (example mapping; ensure the native module uses these or adapt as needed)
    durationMs?: number
    baseColor?: string
    highlightColor?: string
    cornerRadius?: number
    animating?: boolean
    // Required for RNView
    style?: any
}

const NATIVE_VIEW_NAME = "ExpoSkeletonView"

const isIOS = Platform.OS === "ios"
const hasNativeIOS =
    isIOS &&
    (UIManager.getViewManagerConfig?.(NATIVE_VIEW_NAME) != null || // RN >= 0.68
        // Fallback heuristic (older RN)
        // @ts-ignore
        UIManager[NATIVE_VIEW_NAME] != null)

const NativeSkeletonView: React.ComponentType<NativeSkeletonProps> | null = hasNativeIOS
    ? // @ts-ignore
      requireNativeComponent<NativeSkeletonProps>(NATIVE_VIEW_NAME)
    : null

// ---------- Public component API ----------
const SCREEN_WIDTH = sizes.screens.width
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

export interface SkeletonViewProps extends ViewProps {
    children?: React.ReactNode
    /**
     * Delay before starting the animation (ms). Only used by JS fallback.
     */
    delay?: number
    /**
     * Duration of one shimmer cycle (ms).
     * Native iOS prop: durationMs
     */
    duration?: number
    /**
     * Base/background color of the skeleton.
     * Native iOS prop: baseColor
     */
    backgroundColor?: string
    /**
     * Highlight (shimmer) color of the skeleton.
     * Native iOS prop: highlightColor
     */
    gradientColor?: string
    /**
     * Corner radius (applies clipping for native and JS fallback).
     * Native iOS prop: cornerRadius
     */
    borderRadius?: number
    /**
     * Control animation state.
     * Native iOS prop: animating
     */
    isAnimating?: boolean
}

export const SkeletonView: React.FC<SkeletonViewProps> = React.memo(
    ({
        children,
        style,
        delay = 0,
        duration = 1800,
        backgroundColor = colors.gray.grey_08,
        gradientColor = colors.gray.grey_06,
        borderRadius = 10,
        isAnimating = true,
        ...props
    }) => {
        // iOS Native (SwiftUI) path when available
        if (hasNativeIOS && NativeSkeletonView) {
            return (
                <RNView
                    style={[{ overflow: "hidden", borderRadius }, style]}
                    // @ts-ignore
                    pointerEvents="auto"
                    {...props}
                >
                    {/* Native skeleton rendered absolutely behind children */}
                    <NativeSkeletonView
                        style={StyleSheet.absoluteFill}
                        durationMs={duration}
                        baseColor={backgroundColor}
                        highlightColor={gradientColor}
                        cornerRadius={borderRadius}
                        animating={isAnimating}
                    />
                    {children}
                </RNView>
            )
        }

        // JS fallback (cross‑platform): animated gradient shimmer
        const progress = useSharedValue(0)

        React.useEffect(() => {
            if (!isAnimating) return
            // Optional delay start
            const id = setTimeout(() => {
                progress.value = withRepeat(withTiming(1, { duration }), -1, false)
            }, delay)
            return () => {
                clearTimeout(id)
                // stop animation
                progress.value = 0
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [delay, duration, isAnimating])

        const shimmerStyle = useAnimatedStyle(() => {
            const tx = interpolate(progress.value, [0, 1], [-SCREEN_WIDTH, SCREEN_WIDTH])
            return {
                transform: [{ translateX: tx }],
                opacity: isAnimating ? 1 : 0,
            }
        }, [isAnimating])

        return (
            <View
                style={[{ backgroundColor, overflow: "hidden", borderRadius }, style]}
                // @ts-ignore
                pointerEvents="auto"
                {...props}
            >
                <AnimatedLinearGradient
                    colors={[backgroundColor, gradientColor, backgroundColor]}
                    style={[StyleSheet.absoluteFill, shimmerStyle]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                {children}
            </View>
        )
    },
)

export default SkeletonView
