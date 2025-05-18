import { StackCardInterpolationProps } from "@react-navigation/stack"
import { Animated } from "react-native"

export const Interpolation = ({
    current,
    next,
    inverted,
    layouts: { screen },
}: StackCardInterpolationProps) => {
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

    return {
        cardStyle: {
            transform: [
                {
                    translateX: Animated.multiply(
                        progress.interpolate({
                            inputRange: [0, 1, 2],
                            outputRange: [
                                -screen.width, // Começa fora da tela à esquerda
                                0, // Fica centralizada na tela
                                screen.width, // Desaparece fora da tela à direita
                            ],
                            extrapolate: "clamp",
                        }),
                        inverted
                    ),
                },
            ],
        },
    }
}
