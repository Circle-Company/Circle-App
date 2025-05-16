import { StackCardInterpolatedStyle, StackCardInterpolationProps } from "@react-navigation/stack"
import { Animated } from "react-native"

export function Interpolation({
    index,
    current,
    next,
    inverted,
    layouts: { screen },
    insets,
}: StackCardInterpolationProps): StackCardInterpolatedStyle {
    const topOffset = 20
    const statusBarHeight = insets.top
    const aspectRatio = screen.height / screen.width

    const isFirst = index === 0

    const progress = Animated.add(
        current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: "clamp",
        }),
        next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: "clamp",
            })
            : 0
    )

    // 🟢 Suavidade elástica para entrada do modal
    const translateY = Animated.multiply(
        progress.interpolate({
            inputRange: [0, 0.7, 1, 1.2, 2],
            outputRange: [
                screen.height,
                topOffset + 80,
                topOffset,
                topOffset - 10,
                (isFirst ? statusBarHeight : 0) - topOffset * aspectRatio,
            ],
            extrapolate: "clamp",
        }),
        inverted
    )

    // 🔵 Opacidade do overlay com fade mais natural
    const overlayOpacity = progress.interpolate({
        inputRange: [0, 0.7, 1, 1.0001, 2],
        outputRange: [0, 0.4, isFirst ? 0.6 : 0, 1, 1],
        extrapolate: "clamp",
    })

    // 🟠 Bordas mais suaves ao abrir
    const borderRadius = isFirst
        ? progress.interpolate({
            inputRange: [0, 0.8, 1, 1.1],
            outputRange: [0, 8, 16, 24],
            extrapolate: "clamp",
        })
        : 30

    return {
        cardStyle: {
            overflow: "hidden",
            borderTopLeftRadius: borderRadius,
            borderTopRightRadius: borderRadius,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            marginTop: isFirst ? 0 : statusBarHeight,
            marginBottom: isFirst ? 0 : topOffset,
            transform: [{ translateY }],
        },
        overlayStyle: { opacity: overlayOpacity },
    }
}
