import { colors } from "@/layout/constants/colors"
import React from "react"
import { TouchableOpacity, ViewStyle } from "react-native"
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface CaptureButtonProps {
    onPress?: () => void
}

export default function CaptureButton({ onPress }: CaptureButtonProps) {
    // Configurações de animação
    const springConfig = {
        damping: 1,
        stiffness: 200,
    }

    // Estados de animação
    const scale = useSharedValue(1)

    // Estilo base do container
    const container: ViewStyle = {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: colors.gray.white,
        backgroundColor: "transparent",
    }
    // Animação quando o botão é pressionado
    const handlePressIn = () => {
        scale.value = withSpring(0.92, springConfig)
    }

    // Animação quando o botão é solto
    const handlePressOut = () => {
        scale.value = withSequence(
            withTiming(1.05, { duration: 100, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
            withSpring(1, springConfig)
        )
    }

    // Executa a função de callback quando o botão é pressionado
    const handlePress = () => {
        if (onPress) {
            onPress()
        }
    }

    // Estilos animados para o container
    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        }
    })
    return (
        <AnimatedTouchable
            style={[container, animatedContainerStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            activeOpacity={0.9}
        />
    )
}
