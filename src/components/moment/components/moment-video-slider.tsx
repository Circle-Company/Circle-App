import { Animated, View, ViewStyle, Platform } from "react-native"
import React, { useEffect, useRef } from "react"

import { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import BlurredBackground from "../../general/blurred-background"
import { isIOS } from "@/lib/platform/detection"
import { LinearGradient } from "expo-linear-gradient"

interface VideoSliderProps {
    currentTime: number
    duration: number
    width: number
}

export default function MomentVideoSlider({
    currentTime = 0,
    duration = 0,
    width = 0,
}: VideoSliderProps) {
    // Valor animado para o progresso
    const progressAnim = useRef(new Animated.Value(0)).current

    // Atualizar o valor animado quando o progresso muda, com configuração para animação mais suave
    useEffect(() => {
        // Calcular porcentagem de progresso
        const calculateProgress = (): number => {
            if (duration <= 0) return 0
            const progress = (currentTime / duration) * 100
            return Math.min(100, Math.max(0, progress))
        }

        Animated.spring(progressAnim, {
            toValue: calculateProgress(),
            friction: 4, // Menos fricção = movimento mais suave
            tension: 1, // Menos tensão = movimento mais lento e uniforme
            useNativeDriver: false,
            restDisplacementThreshold: 0.001, // Valores menores fazem a animação continuar por mais tempo
            restSpeedThreshold: 0.001, // Valores menores fazem a animação continuar por mais tempo
        }).start()
    }, [currentTime, duration, progressAnim])

    const container: ViewStyle = {
        marginVertical: sizes.margins["1sm"],
        paddingHorizontal: sizes.margins["1sm"],
        width: width - sizes.margins["1md"] * 2,
        alignSelf: "center",
    }

    const sliderContainer: ViewStyle = {
        height: 4,
        justifyContent: "center",
    }

    const track: ViewStyle = {
        borderRadius: 3,
        position: "absolute",
        width: "100%",
        height: 3,
    }

    const backgroundTrack: ViewStyle = {
        backgroundColor: colors.gray.grey_05,
        height: 3,
        opacity: 0.7,
    }

    const progressTrack: ViewStyle = {
        backgroundColor: colors.gray.grey_04,
        height: 4,
        borderRadius: 3,
        left: 0,
        position: "absolute",
    }

    // O estilo de progresso para o Animated.View
    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
        extrapolate: "clamp", // Garante que o valor não ultrapasse os limites
    })

    if (isIOS) {
        return (
            <View style={container}>
                <BlurredBackground
                    intensity={10}
                    tint="systemMaterialDark"
                    overlayColor={`${colors.gray.grey_04}20`}
                    radius={6}
                    style={sliderContainer}
                >
                    <Animated.View
                        style={[
                            progressTrack,
                            { width: progressWidth, overflow: "hidden", opacity: 0.5 },
                        ]}
                    >
                        <LinearGradient
                            style={{ width: "100%", height: "100%" }}
                            colors={[colors.gray.white + "20", colors.gray.white]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                    </Animated.View>
                </BlurredBackground>
            </View>
        )
    }

    return (
        <View style={container}>
            <View style={sliderContainer}>
                <View style={[track, backgroundTrack]} />
                <Animated.View style={[progressTrack, { width: progressWidth }]} />
            </View>
        </View>
    )
}
