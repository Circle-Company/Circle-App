/**
 * Componente de botão para troca de câmera
 */
import React from "react"
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"

// Importação do ícone SVG
import RotateIcon from "../../../../../assets/icons/svgs/arrow_circlepath.svg"

// Componente Touchable animado
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

interface RotateButtonProps {
    /**
     * Função chamada quando o botão é pressionado
     */
    onPress?: () => void

    /**
     * Tamanho do ícone (padrão: 24)
     */
    size?: number

    /**
     * Cor do ícone (padrão: #FFFFFF)
     */
    color?: string

    /**
     * Estilo adicional para o botão
     */
    style?: ViewStyle

    /**
     * Se o botão está desabilitado
     */
    disabled?: boolean
}

/**
 * Botão para alternar entre câmera frontal e traseira
 */
const RotateButton: React.FC<RotateButtonProps> = ({
    onPress,
    size = 24,
    color = "#FFFFFF",
    style,
    disabled = false,
}) => {
    // Configurações de animação
    const springConfig = {
        damping: 10,
        stiffness: 100,
    }

    // Estados de animação
    const scale = useSharedValue(1)
    const rotation = useSharedValue(0)

    // Animação quando o botão é pressionado
    const handlePressIn = () => {
        if (disabled) return
        scale.value = withSpring(0.85, springConfig)
    }

    // Animação quando o botão é solto
    const handlePressOut = () => {
        if (disabled) return
        scale.value = withSequence(withTiming(1.05, { duration: 100 }), withSpring(1, springConfig))
    }

    // Animação quando o botão é pressionado
    const handlePress = () => {
        if (disabled || !onPress) return

        // Animar o ícone girando 360 graus
        rotation.value = withSequence(withTiming(rotation.value + 1, { duration: 300 }))

        onPress()
    }

    // Estilos animados para o container
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }, { rotate: `${rotation.value * 360}deg` }],
        }
    })

    return (
        <AnimatedTouchable
            style={[styles.container, animatedStyle, style]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled}
        >
            <RotateIcon width={size} height={size} fill={color} />
        </AnimatedTouchable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(50, 50, 50, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
})

export default RotateButton
