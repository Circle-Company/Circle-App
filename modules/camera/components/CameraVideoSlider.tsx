import React, { useEffect, useRef } from "react"
import { Animated, View, Text, ViewStyle } from "react-native"
import { colors } from "@/constants/colors"
import sizes from "@/constants/sizes"

import { useCameraContext } from "../context"
import { iOSMajorVersion } from "@/lib/platform/detection"
import { Host, LinearProgress, VStack } from "@expo/ui/swift-ui"

interface CameraVideoSliderProps {
    maxTime?: number // segundos, default 30
    width?: number
    currentTime?: number // tempo atual do vídeo, opcional
}

function formatCurrentTime(sec: number): string {
    // Formato: 0X (dois dígitos inteiros de 00 a 30)
    const seconds = Math.floor(sec)
    return seconds.toString().padStart(2, "0")
}

export default function CameraVideoSlider({
    maxTime = 30,
    width = sizes.moment.full.width,
    currentTime,
}: CameraVideoSliderProps) {
    const { recordingTime } = useCameraContext()
    const progressAnim = useRef(new Animated.Value(0)).current

    // Use currentTime se fornecido, senão recordingTime do contexto
    const sliderTime = typeof currentTime === "number" ? currentTime : recordingTime

    useEffect(() => {
        const calculateProgress = (): number => {
            if (maxTime <= 0) return 0
            const progress = (sliderTime / maxTime) * 100
            return Math.min(100, Math.max(0, progress))
        }

        Animated.spring(progressAnim, {
            toValue: calculateProgress(),
            friction: 4,
            tension: 1,
            useNativeDriver: false,
            restDisplacementThreshold: 0.001,
            restSpeedThreshold: 0.001,
        }).start()
    }, [sliderTime, maxTime, progressAnim])

    const container: ViewStyle = {
        position: "absolute",
        bottom: 10, // mais acima, dentro da imagem da câmera
        left: "50%",
        transform: [{ translateX: -(width - sizes.margins["2md"] * 2) / 2 }],
        paddingHorizontal: sizes.margins["2md"],
        width: width - sizes.margins["2md"] * 2,
        zIndex: 30,
    }

    const sliderContainer: ViewStyle = {
        height: 6,
        justifyContent: "center",
        marginTop: 4,
    }

    const track: ViewStyle = {
        borderRadius: 3,
        position: "absolute",
        width: "100%",
        height: 3,
    }

    const backgroundTrack: ViewStyle = {
        backgroundColor: colors.gray.grey_05,
        height: 4,
        opacity: 0.7,
    }

    const progressTrack: ViewStyle = {
        backgroundColor: colors.gray.white,
        height: 6,
        borderRadius: 3,
        left: 0,
        position: "absolute",
    }

    const timeRow: ViewStyle = {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 2,
        paddingHorizontal: 2,
    }

    const timeTextStyle = {
        color: colors.gray.white,
        fontSize: 15,
        fontWeight: "bold",
    }

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
        extrapolate: "clamp",
    })

    if (iOSMajorVersion! >= 26) {
        return (
            <Host style={{ width }}>
                <LinearProgress progress={sliderTime} color={colors.gray.white} />
            </Host>
        )
    } else {
        return (
            <View style={container}>
                <View style={sliderContainer}>
                    <View style={[track, backgroundTrack]} />
                    <Animated.View style={[progressTrack, { width: progressWidth }]} />
                </View>
            </View>
        )
    }
}
