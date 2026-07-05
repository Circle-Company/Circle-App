import React from "react"
import type { LayoutChangeEvent } from "react-native"
import { StyleSheet, Text, View } from "react-native"
import Reanimated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import { useCameraContext } from "../context"

interface RecordingProgressHeaderTitleProps {
    label: string
    maxTime: number
}

const CONTAINER_HEIGHT = 40

// "Recording 3s" style formatter. Floor to whole seconds so the ticks in
// the header don't jitter mid-second — the purple fill already tracks
// sub-second progression visually.
const formatSeconds = (seconds: number): string => `${Math.floor(seconds)}s`

export function RecordingProgressHeaderTitle({
    label,
    maxTime,
}: RecordingProgressHeaderTitleProps): React.ReactElement {
    const { recordingTime } = useCameraContext()

    const containerScale = useSharedValue(0.7)
    const progress = useSharedValue(0)
    // Shared value, not React state — React Navigation re-invokes the
    // headerTitle callback on every context tick, and useAnimatedStyle's
    // closure would sometimes capture 0, leaving the fill invisible.
    const containerWidth = useSharedValue(0)

    React.useEffect(() => {
        containerScale.value = withSpring(1, { damping: 14, stiffness: 180, mass: 0.7 })
    }, [containerScale])

    React.useEffect(() => {
        const target = Math.min(1, Math.max(0, recordingTime / maxTime))
        progress.value = withTiming(target, { duration: 110 })
    }, [recordingTime, maxTime, progress])

    const onContainerLayout = React.useCallback(
        (e: LayoutChangeEvent) => {
            containerWidth.value = e.nativeEvent.layout.width
        },
        [containerWidth],
    )

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: containerScale.value }],
    }))
    const fillAnimatedStyle = useAnimatedStyle(() => ({
        width: progress.value * containerWidth.value,
    }))

    return (
        <Reanimated.View
            style={[styles.container, containerAnimatedStyle]}
            onLayout={onContainerLayout}
        >
            <View style={styles.fillWrapper} pointerEvents="none">
                <Reanimated.View style={[styles.fill, fillAnimatedStyle]} />
            </View>
            <View style={styles.labelWrap} pointerEvents="none">
                <Text style={styles.label} numberOfLines={1}>
                    {label} {formatSeconds(recordingTime)}
                </Text>
            </View>
        </Reanimated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        minWidth: 140,
        height: CONTAINER_HEIGHT,
        borderRadius: CONTAINER_HEIGHT / 2,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    // Literal instead of `...StyleSheet.absoluteFillObject` — that name was
    // dropped from RN 0.85 typings, and `absoluteFill` is a stylesheet id
    // (number) which can't be spread.
    fillWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    fill: {
        height: "100%",
        backgroundColor: colors.purple.purple_06,
    },
    labelWrap: {
        height: CONTAINER_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        color: colors.gray.white,
        fontSize: 18,
        fontFamily: fonts.family["Black-Italic"],
        letterSpacing: 0.4,
        textAlign: "center",
        // Counters iOS's Inter-BlackItalic descender padding.
        marginTop: -2,
    },
})
