import React from "react"
import { StyleSheet, ViewProps, useColorScheme } from "react-native"
import LinearGradient from "react-native-linear-gradient"
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated"
import { View } from "../../components/Themed"
import { colors } from "../../layout/constants/colors"
import sizes from "../../layout/constants/sizes"

const width = sizes.screens.width
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

interface SkeletonViewProps extends ViewProps {
    children?: React.ReactNode
    delay?: number
    duration?: number
    backgroundColor?: string
    gradientColor?: string
}

export const SkeletonView: React.FC<SkeletonViewProps> = React.memo(
    ({ children, style, delay = 0, duration = 3000, backgroundColor, gradientColor, ...props }) => {
        const isDarkMode = useColorScheme() === "dark"
        const x = useSharedValue(0)

        // Aumentando a duração para 3000ms (3 segundos)
        React.useEffect(() => {
            x.value = withRepeat(withTiming(1, { duration }), -1, false)
        }, [])

        const containerStyle = React.useMemo(
            () => ({
                backgroundColor:
                    backgroundColor || isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
                overflow: "hidden",
            }),
            [backgroundColor, isDarkMode]
        )

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: interpolate(x.value, [0, 1], [-width, width]) }],
        }))

        return (
            <View style={[containerStyle, style]} {...props}>
                <AnimatedLinearGradient
                    colors={[
                        backgroundColor || isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
                        gradientColor || isDarkMode ? colors.gray.grey_06 : colors.gray.grey_01,
                        backgroundColor || isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
                    ]}
                    style={[animatedStyle, StyleSheet.absoluteFillObject]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                {children}
            </View>
        )
    }
)
