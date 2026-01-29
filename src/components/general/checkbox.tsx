import React from "react"
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
    Platform,
    useColorScheme,
} from "react-native"
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import { colors } from "@/constants/colors"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { Host, Button } from "@expo/ui/swift-ui"

export interface CheckboxProps {
    // Controlled value. If provided, component becomes controlled
    checked?: boolean
    // Initial value for uncontrolled usage
    defaultChecked?: boolean
    // Change callback
    onChange?: (next: boolean) => void

    // Visuals
    label?: string
    size?: number // box size (width/height)
    color?: string // accent color when checked
    disabled?: boolean

    // Layout
    style?: StyleProp<ViewStyle>
    labelStyle?: StyleProp<TextStyle>
    hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number }

    // Accessibility / testing
    accessibilityLabel?: string
    testID?: string
}

/**
 * Generic Checkbox component:
 * - iOS: SwiftUI Button with systemImage (checkmark.square.fill / square)
 * - Android/Others: Pressable + Reanimated for animated fill/scale
 *
 * Controlled and uncontrolled usage:
 * - Provide `checked` to control from parent
 * - Or use `defaultChecked` for internal state
 */
export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    defaultChecked = false,
    onChange,
    label,
    size = 20,
    color: accentColor = colors.purple.purple_05.toString(),
    disabled = false,
    style,
    labelStyle,
    hitSlop = 6,
    testID,
}) => {
    const isDarkMode = useColorScheme() === "dark"

    const isControlled = typeof checked === "boolean"
    const [uncontrolled, setUncontrolled] = React.useState<boolean>(defaultChecked)
    const resolvedChecked = isControlled ? (checked as boolean) : uncontrolled

    // Reanimated progress 0..1
    const progress = useSharedValue(resolvedChecked ? 1 : 0)

    React.useEffect(() => {
        progress.value = withTiming(resolvedChecked ? 1 : 0, { duration: 160 })
    }, [resolvedChecked, progress])

    const toggle = React.useCallback(
        (next: boolean) => {
            if (disabled) return

            // Haptics
            if (next) Vibrate("effectClick")
            else Vibrate("impactLight")

            if (!isControlled) setUncontrolled(next)
            onChange?.(next)
        },
        [disabled, isControlled, onChange],
    )

    // iOS SwiftUI variant using Button + systemImage
    if (Platform.OS === "ios") {
        const systemImage = resolvedChecked ? "checkmark.square.fill" : "square"
        const tint = disabled
            ? isDarkMode
                ? colors.gray.grey_06.toString()
                : colors.gray.grey_03.toString()
            : accentColor

        return (
            <View style={[styles.row, { opacity: disabled ? 0.8 : 1 }, style]}>
                <Host matchContents>
                    <Button
                        testID={testID}
                        systemImage={systemImage}
                        color={tint}
                        disabled={disabled}
                        variant="plain"
                        controlSize="regular"
                        onPress={() => toggle(!resolvedChecked)}
                    />
                </Host>
                {label ? (
                    <Pressable onPress={() => toggle(!resolvedChecked)} disabled={disabled}>
                        <Text
                            style={[
                                {
                                    color: isDarkMode ? colors.gray.white : colors.gray.black,
                                    marginLeft: 6,
                                },
                                labelStyle,
                            ]}
                        >
                            {label}
                        </Text>
                    </Pressable>
                ) : null}
            </View>
        )
    }

    // Android / Others: Animated fallback
    const trackStyle = useAnimatedStyle(() => {
        const bg = interpolateColor(
            progress.value,
            [0, 1],
            [isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02, accentColor],
        )
        const border = interpolateColor(
            progress.value,
            [0, 1],
            [isDarkMode ? colors.gray.grey_05 : colors.gray.grey_04, accentColor],
        )
        return {
            backgroundColor: bg,
            borderColor: border,
        }
    })

    const innerStyle = useAnimatedStyle(() => {
        const scale = withSpring(progress.value ? 1 : 0.5, { stiffness: 500, damping: 35 })
        const opacity = withTiming(progress.value ? 1 : 0, { duration: 120 })
        return {
            transform: [{ scale }],
            opacity,
        }
    })

    const rowDisabled = disabled
        ? isDarkMode
            ? colors.transparent.white_20.toString()
            : colors.transparent.black_10.toString()
        : "transparent"

    return (
        <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: resolvedChecked, disabled }}
            testID={testID}
            onPress={() => toggle(!resolvedChecked)}
            disabled={disabled}
            hitSlop={hitSlop as any}
            style={[styles.row, { opacity: disabled ? 0.8 : 1 }, style]}
        >
            <Animated.View
                style={[
                    styles.box,
                    {
                        width: size,
                        height: size,
                        borderRadius: 4,
                        borderWidth: 2,
                        backgroundColor: rowDisabled,
                    },
                    trackStyle,
                ]}
            >
                <Animated.View
                    style={[
                        styles.inner,
                        {
                            width: size - 6,
                            height: size - 6,
                            borderRadius: 2,
                            backgroundColor: isDarkMode ? colors.gray.black : colors.gray.white,
                        },
                        innerStyle,
                    ]}
                />
            </Animated.View>

            {label ? (
                <Text
                    numberOfLines={2}
                    style={[
                        styles.label,
                        {
                            color: isDarkMode ? colors.gray.white : colors.gray.black,
                        },
                        labelStyle,
                    ]}
                >
                    {label}
                </Text>
            ) : null}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    box: {
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    inner: {
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        fontSize: 14,
        includeFontPadding: false,
    },
})

export default Checkbox
