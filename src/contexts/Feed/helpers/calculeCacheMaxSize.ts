import { useContext, useMemo } from "react"

import PersistedContext from "@/contexts/Persisted"

type DeviceMetadata = {
    deviceId?: string
    screenWidth?: number
    screenHeight?: number
    isTablet?: boolean
    pixelDensity?: number
    fontScale?: number
    totalMemory?: number
    availableMemory?: number
}

const DEFAULT_METADATA: Required<DeviceMetadata> = {
    deviceId: "",
    screenWidth: 0,
    screenHeight: 0,
    isTablet: false,
    pixelDensity: 1,
    fontScale: 1,
    totalMemory: 0,
    availableMemory: 0,
}

export function useCalculeCacheMaxSize(feedDataLength: number): number {
    const { device } = useContext(PersistedContext)
    const metadata = (device as any)?.metadata as DeviceMetadata | undefined

    return useMemo(() => {
        if (!metadata) {
            return 50
        }

        const safeMetadata: Required<DeviceMetadata> = {
            ...DEFAULT_METADATA,
            ...metadata,
        }

        // Verificar se os metadados estão disponíveis
        if (!safeMetadata.deviceId) {
            return 50 // Valor padrão se metadados não disponíveis
        }

        // Usar dados reais de memória se disponíveis, senão estimar
        const getDeviceMemoryTier = () => {
            // Se temos dados reais de memória, usar eles
            if (safeMetadata.totalMemory > 0) {
                const totalMemoryGB = safeMetadata.totalMemory / (1024 * 1024 * 1024)
                const memoryAvailablePercentage =
                    (safeMetadata.availableMemory / safeMetadata.totalMemory) * 100

                // Classificar baseado na memória total
                if (totalMemoryGB >= 8) {
                    return memoryAvailablePercentage > 30 ? "high" : "medium-high"
                } else if (totalMemoryGB >= 6) {
                    return memoryAvailablePercentage > 25 ? "medium-high" : "medium"
                } else if (totalMemoryGB >= 4) {
                    return memoryAvailablePercentage > 20 ? "medium" : "low"
                } else {
                    return "low"
                }
            }

            // Fallback: estimar baseado nas características do dispositivo
            const screenArea = safeMetadata.screenWidth * safeMetadata.screenHeight
            const isHighEndDevice =
                safeMetadata.isTablet ||
                screenArea > 2400000 || // telas muito grandes (>1920x1250)
                safeMetadata.pixelDensity > 3

            if (safeMetadata.isTablet) {
                return "high" // Tablets geralmente têm 6GB+
            } else if (isHighEndDevice) {
                return "medium-high" // Dispositivos premium (4-8GB)
            } else if (screenArea > 1800000) {
                return "medium" // Dispositivos intermediários (3-6GB)
            } else {
                return "low" // Dispositivos básicos (2-4GB)
            }
        }

        // Fatores baseados nos metadados do dispositivo
        const deviceFactors = {
            // Dispositivos com tela maior podem ter cache maior
            screenFactor: Math.min(
                (safeMetadata.screenWidth * safeMetadata.screenHeight) / (1920 * 1080),
                2,
            ),
            // Tablets geralmente têm mais memória
            tabletFactor: safeMetadata.isTablet ? 1.5 : 1,
            // Densidade de pixels afeta o uso de memória (maior densidade = mais memória usada por imagem)
            densityFactor: Math.max(0.7, 2.2 - safeMetadata.pixelDensity),
            // Fator de escala da fonte pode indicar dispositivos com menos recursos
            fontScaleFactor: safeMetadata.fontScale > 1.3 ? 0.8 : 1, // usuários com fonte grande podem ter dispositivos mais antigos
        }

        // Tamanho base do cache baseado na capacidade real ou estimada
        const memoryTier = getDeviceMemoryTier()
        let baseCacheSize = 50

        switch (memoryTier) {
            case "high":
                baseCacheSize = 120 // Tablets e dispositivos super high-end
                break
            case "medium-high":
                baseCacheSize = 90 // Smartphones high-end
                break
            case "medium":
                baseCacheSize = 70 // Smartphones intermediários
                break
            case "low":
                baseCacheSize = 45 // Dispositivos básicos
                break
        }

        // Aplicar fatores do dispositivo
        const finalCacheSize = Math.floor(
            baseCacheSize *
                deviceFactors.screenFactor *
                deviceFactors.tabletFactor *
                deviceFactors.densityFactor *
                deviceFactors.fontScaleFactor,
        )

        // Garantir limites mínimos e máximos
        const optimizedSize = Math.max(20, Math.min(200, finalCacheSize))

        // Log detalhado incluindo dados de capacidade
        const memoryInfo =
            safeMetadata.totalMemory > 0
                ? `${Math.round(safeMetadata.totalMemory / 1024 / 1024 / 1024)}GB RAM (${Math.round(
                      (safeMetadata.availableMemory / safeMetadata.totalMemory) * 100,
                  )}% livre)`
                : "RAM estimada"

        console.log(
            `Cache calculado: ${optimizedSize} items (Tier: ${memoryTier}, ${memoryInfo}, Tablet: ${safeMetadata.isTablet}, Tela: ${safeMetadata.screenWidth}x${safeMetadata.screenHeight})`,
        )

        return optimizedSize
    }, [metadata, feedDataLength])
}
