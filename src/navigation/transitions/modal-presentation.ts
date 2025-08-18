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
    const statusBarHeight = insets.top
    const isFirst = index === 0

    // Progresso de navegação
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
            : 0,
    )

    // Se for a primeira tela, mantém animação "modal"
    // Se não for, usa apenas slide horizontal
    const translateX = Animated.multiply(
        progress.interpolate({
            inputRange: [0, 1],
            outputRange: [screen.width, 0],
            extrapolate: "clamp",
        }),
        inverted,
    )

    const translateY = isFirst
        ? Animated.multiply(
              progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screen.height, 0],
                  extrapolate: "clamp",
              }),
              inverted,
          )
        : 0 // nas telas internas não há "subida" do modal

    const overlayOpacity = isFirst
        ? progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
              extrapolate: "clamp",
          })
        : 0 // sem overlay extra para telas internas

    return {
        cardStyle: {
            overflow: "hidden",
            borderRadius: isFirst ? 16 : 0,
            marginTop: statusBarHeight + 20,
            transform: isFirst ? [{ translateY }] : [{ translateX }], // muda a transição
        },
        overlayStyle: { opacity: overlayOpacity },
    }
}
