import { storage, storageKeys } from "@/store"

export function calculeChunksMaxSize(): number {
    try {
        // Obter metadados do storage sem criar dependência circular
        const storageKey = storageKeys().deviceMetadata

        const totalMemory = storage.getNumber(storageKey.totalMemory) || 0
        const availableMemory = storage.getNumber(storageKey.availableMemory) || 0
        const freeDiskStorage = storage.getNumber(storageKey.freeDiskStorage) || 0
        const batteryLevel = storage.getNumber(storageKey.batteryLevel) || 0
        const isLowPowerModeEnabled = storage.getBoolean(storageKey.isLowPowerModeEnabled) || false
        const isTablet = storage.getBoolean(storageKey.isTablet) || false
        const screenWidth = storage.getNumber(storageKey.screenWidth) || 0
        const screenHeight = storage.getNumber(storageKey.screenHeight) || 0
        const pixelDensity = storage.getNumber(storageKey.pixelDensity) || 1
        const fontScale = storage.getNumber(storageKey.fontScale) || 1
        const deviceType = storage.getString(storageKey.deviceType) || ""

        // Usar dados reais de memória se disponíveis
        if (totalMemory > 0 && freeDiskStorage > 0) {
            const totalMemoryGB = totalMemory / (1024 * 1024 * 1024)
            const memoryAvailablePercentage = (availableMemory / totalMemory) * 100
            const freeDiskStorageGB = freeDiskStorage / (1024 * 1024 * 1024)
            const batteryPercentage = batteryLevel * 100

            // Calcular score de performance
            let performanceScore = 0

            // Memória RAM (40%)
            if (totalMemoryGB >= 12) performanceScore += 40
            else if (totalMemoryGB >= 8) performanceScore += 35
            else if (totalMemoryGB >= 6) performanceScore += 30
            else if (totalMemoryGB >= 4) performanceScore += 20
            else performanceScore += 10

            // Disponibilidade de memória (20%)
            if (memoryAvailablePercentage >= 50) performanceScore += 20
            else if (memoryAvailablePercentage >= 30) performanceScore += 15
            else if (memoryAvailablePercentage >= 20) performanceScore += 10
            else performanceScore += 5

            // Armazenamento livre (20%)
            if (freeDiskStorageGB >= 32) performanceScore += 20
            else if (freeDiskStorageGB >= 16) performanceScore += 15
            else if (freeDiskStorageGB >= 8) performanceScore += 10
            else if (freeDiskStorageGB >= 4) performanceScore += 5
            else performanceScore += 2

            // Bateria (10%)
            if (batteryPercentage >= 50) performanceScore += 10
            else if (batteryPercentage >= 30) performanceScore += 7
            else if (batteryPercentage >= 15) performanceScore += 5
            else performanceScore += 2

            // Modo economia (5%)
            if (!isLowPowerModeEnabled) performanceScore += 5

            // Tipo dispositivo (5%)
            if (isTablet) performanceScore += 5
            else if (deviceType === "Handset") performanceScore += 3

            // Determinar tier
            let performanceTier: string
            if (performanceScore >= 85) performanceTier = "ultra-high"
            else if (performanceScore >= 70) performanceTier = "high"
            else if (performanceScore >= 55) performanceTier = "medium-high"
            else if (performanceScore >= 40) performanceTier = "medium"
            else if (performanceScore >= 25) performanceTier = "low"
            else performanceTier = "very-low"

            // Tamanho base
            let baseChunksSize = 50
            switch (performanceTier) {
                case "ultra-high":
                    baseChunksSize = 80
                    break
                case "high":
                    baseChunksSize = 70
                    break
                case "medium-high":
                    baseChunksSize = 60
                    break
                case "medium":
                    baseChunksSize = 50
                    break
                case "low":
                    baseChunksSize = 35
                    break
                case "very-low":
                    baseChunksSize = 25
                    break
            }

            // Aplicar fatores de ajuste
            const screenFactor =
                screenWidth > 0 ? Math.min((screenWidth * screenHeight) / (1920 * 1080), 1.8) : 1
            const tabletFactor = isTablet ? 1.3 : 1
            const densityFactor = Math.max(0.6, 1.8 - (pixelDensity - 1) * 0.2)
            const fontScaleFactor = fontScale > 1.5 ? 0.85 : 1
            const powerSaveFactor = isLowPowerModeEnabled ? 0.7 : 1
            const batteryFactor = batteryLevel < 0.2 ? 0.8 : 1

            const finalSize = Math.floor(
                baseChunksSize *
                    screenFactor *
                    tabletFactor *
                    densityFactor *
                    fontScaleFactor *
                    powerSaveFactor *
                    batteryFactor,
            )

            return Math.max(15, Math.min(100, finalSize))
        }

        // Fallback baseado em características básicas
        const screenArea = screenWidth * screenHeight
        if (isTablet) return 70
        else if (screenArea > 2400000) return 60
        else if (screenArea > 1800000) return 50
        else return 35
    } catch (error) {
        console.warn("Erro ao calcular chunks max size:", error)
        return 50 // Valor padrão seguro
    }
}
