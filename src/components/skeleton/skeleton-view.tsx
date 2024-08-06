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
    backgroundColor?: string
    gradientColor?: string
}

export const SkeletonView = React.memo(
    ({
        children,
        style,
        delay = 0,
        backgroundColor,
        gradientColor,
        ...props
    }: SkeletonViewProps) => {
        const isDarkMode = useColorScheme() === "dark"
        const x = useSharedValue(0)

        React.useEffect(() => {
            const startAnimation = () => {
                x.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false)
            }
            const timeoutId = setTimeout(startAnimation, delay)
            return () => clearTimeout(timeoutId)
        }, [delay])

        const containerStyle = React.useMemo(
            () => ({
                backgroundColor:
                    backgroundColor || isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
                overflow: "hidden",
            }),
            [backgroundColor]
        )

        const lineStyle = React.useMemo(() => StyleSheet.absoluteFillObject, [])

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
                    style={[animatedStyle, lineStyle]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                {children}
            </View>
        )
    }
)
