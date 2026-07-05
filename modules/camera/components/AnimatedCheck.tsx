import React from "react"
import Reanimated, {
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import Svg, { Circle, Path } from "react-native-svg"

import { colors } from "@/constants/colors"

const AnimatedPath = Reanimated.createAnimatedComponent(Path)

interface Props {
    size?: number
}

// Length of the checkmark stroke path (approximate; used as the initial
// dash offset so the line reveals itself when animated toward 0).
const CHECK_STROKE_LENGTH = 34

/**
 * Purple circle with a white checkmark that pops in with a spring and then
 * draws the stroke. Used inside the CancelShareCard when the share flow
 * completes successfully.
 */
export function AnimatedCheck({ size = 72 }: Props): React.ReactElement {
    const scale = useSharedValue(0)
    const dashOffset = useSharedValue(CHECK_STROKE_LENGTH)

    React.useEffect(() => {
        scale.value = withSpring(1, { damping: 10, stiffness: 220, mass: 0.6 })
        // Small delay before drawing so the circle pops first, then the check
        // reveals — reads more naturally than both happening at once.
        dashOffset.value = withTiming(0, { duration: 380 })
    }, [scale, dashOffset])

    const wrapStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))
    const pathProps = useAnimatedProps(() => ({
        strokeDashoffset: dashOffset.value,
    }))

    const half = size / 2
    const radius = half - 2

    return (
        <Reanimated.View style={wrapStyle}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle
                    cx={half}
                    cy={half}
                    r={radius}
                    fill={colors.purple.purple_04}
                />
                <AnimatedPath
                    d={`M ${size * 0.28} ${size * 0.52} L ${size * 0.44} ${size * 0.68} L ${size * 0.72} ${size * 0.36}`}
                    stroke={colors.gray.white}
                    strokeWidth={size * 0.09}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    strokeDasharray={CHECK_STROKE_LENGTH}
                    animatedProps={pathProps}
                />
            </Svg>
        </Reanimated.View>
    )
}
