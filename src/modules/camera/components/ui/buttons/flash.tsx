/**
 * Componente de botão de flash da câmera
 *
 * Controla os diferentes modos de flash da câmera: off, on, auto e torch
 */
import { colors } from "@/layout/constants/colors"
import React, { useMemo } from "react"
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"
import FlashOffIcon from "../../../../../assets/icons/svgs/flashlight_off_fill.svg"
import FlashOnIcon from "../../../../../assets/icons/svgs/flashlight_on_fill.svg"
import { FlashMode } from "../../../types/camera.types"

// Componentes animados
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)
const AnimatedView = Animated.createAnimatedComponent(View)

interface FlashButtonProps {
    /**
     * Modo atual do flash
     */
    mode: FlashMode

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
 * Botão de controle do flash com animação
 */
const FlashButton: React.FC<FlashButtonProps> = ({
    mode,
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
    const torchGlow = useSharedValue(0)

    // Iniciar a animação de brilho quando o modo é "torch"
    React.useEffect(() => {
        if (mode === "torch") {
            // Animar o brilho pulsante para modo torch
            torchGlow.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 1000 }),
                    withTiming(0.4, { duration: 1000 })
                ),
                -1, // repetir infinitamente
                true // reverter a animação
            )
        } else {
            // Parar a animação para outros modos
            torchGlow.value = withTiming(0, { duration: 300 })
        }
    }, [mode, torchGlow])

    // Obter o ícone correto com base no modo
    const getFlashIcon = useMemo(() => {
        switch (mode) {
            case "on":
                return "flash"
            case "auto":
                return "flash-auto"
            case "torch":
                return "flashlight"
            case "off":
            default:
                return "flash-off"
        }
    }, [mode])

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

    // Estilos animados para o container
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        }
    })

    // Estilo animado para o efeito de brilho no modo torch
    const glowStyle = useAnimatedStyle(() => {
        return {
            opacity: torchGlow.value,
            backgroundColor: `rgba(255, 180, 0, ${torchGlow.value * 0.1})`,
        }
    })

    // Resolver o nome do ícone com base no modo atual
    const iconName = getFlashIcon

    return (
        <AnimatedTouchable
            style={[styles.container, animatedStyle, style]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            disabled={disabled}
        >
            {/* Indicador de Modo */}
            {mode !== "off" && mode !== "on" && (
                <View
                    style={[
                        styles.modeIndicator,
                        {
                            backgroundColor:
                                mode === "torch" ? `rgb(255, 231, 183)` : colors.gray.white,
                        },
                    ]}
                >
                    <Text style={styles.modeText}>
                        {mode === "auto" ? "A" : mode === "torch" ? "T" : ""}
                    </Text>
                </View>
            )}

            {/* Efeito de brilho para o modo torch */}
            {mode === "torch" && <AnimatedView style={[styles.torchGlow, glowStyle]} />}
            {iconName === "flash-off" && <FlashOffIcon width={size} height={size} fill={color} />}
            {iconName === "flash" && <FlashOnIcon width={size} height={size} fill={color} />}
            {iconName === "flashlight" && (
                <FlashOnIcon width={size} height={size} fill={colors.yellow.yellow_01} />
            )}
            {iconName === "flash-auto" && <FlashOnIcon width={size} height={size} fill={color} />}
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
    modeIndicator: {
        position: "absolute",
        top: 2,
        right: 2,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    modeText: {
        color: "#000",
        fontSize: 10,
        fontWeight: "bold",
    },
    torchGlow: {
        position: "absolute",
        width: "100%",
        height: "100%",
        borderRadius: 25,
        zIndex: 0,
    },
})

export default FlashButton
