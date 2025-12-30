import { useMemo } from "react"
import { Dimensions, PixelRatio } from "react-native"
import * as Device from "expo-device"

export function useCalculeCacheMaxSize(feedDataLength: number): number {
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
    const pixelDensity = PixelRatio.get()
    const fontScale = typeof PixelRatio.getFontScale === "function" ? PixelRatio.getFontScale() : 1
    const totalMemory = typeof Device.totalMemory === "number" ? Device.totalMemory : 0

    // Heurística simples para tablet usando expo-device (nome/modelo) e dimensões
    const isTablet =
        (Device.modelName?.toLowerCase?.().includes("ipad") ?? false) ||
        (Device.deviceName?.toLowerCase?.().includes("tablet") ?? false) ||
        Math.min(screenWidth, screenHeight) >= 600

    return useMemo(() => {
        // Tentar classificar com base em memória real se disponível
        const screenArea = screenWidth * screenHeight

        const getDeviceMemoryTier = (): "high" | "medium-high" | "medium" | "low" => {
            if (totalMemory > 0) {
                const totalMemoryGB = totalMemory / (1024 * 1024 * 1024)
                if (totalMemoryGB >= 8) return "high"
                if (totalMemoryGB >= 6) return "medium-high"
                if (totalMemoryGB >= 4) return "medium"
                return "low"
            }

            // Fallback: estimar baseado nas características do dispositivo
            const isHighEndDevice = isTablet || screenArea > 2400000 || pixelDensity > 3
            if (isTablet) return "high"
            if (isHighEndDevice) return "medium-high"
            if (screenArea > 1800000) return "medium"
            return "low"
        }

        const deviceFactors = {
            screenFactor: Math.min(screenArea / (1920 * 1080), 2),
            tabletFactor: isTablet ? 1.5 : 1,
            densityFactor: Math.max(0.7, 2.2 - pixelDensity),
            fontScaleFactor: fontScale > 1.3 ? 0.8 : 1,
        }

        const memoryTier = getDeviceMemoryTier()
        let baseCacheSize = 50

        switch (memoryTier) {
            case "high":
                baseCacheSize = 120
                break
            case "medium-high":
                baseCacheSize = 90
                break
            case "medium":
                baseCacheSize = 70
                break
            case "low":
            default:
                baseCacheSize = 45
                break
        }

        const finalCacheSize = Math.floor(
            baseCacheSize *
                deviceFactors.screenFactor *
                deviceFactors.tabletFactor *
                deviceFactors.densityFactor *
                deviceFactors.fontScaleFactor,
        )

        const optimizedSize = Math.max(20, Math.min(200, finalCacheSize))

        const memoryInfo =
            totalMemory > 0
                ? `${Math.round(totalMemory / 1024 / 1024 / 1024)}GB RAM`
                : "RAM estimada"

        console.log(
            `Cache calculado: ${optimizedSize} items (Tier: ${memoryTier}, ${memoryInfo}, Tablet: ${isTablet}, Tela: ${screenWidth}x${screenHeight})`,
        )

        return optimizedSize
    }, [screenWidth, screenHeight, pixelDensity, fontScale, totalMemory, isTablet, feedDataLength])
}
