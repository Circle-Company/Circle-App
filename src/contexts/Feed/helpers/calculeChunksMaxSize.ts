import { Dimensions, PixelRatio } from "react-native"
import * as Device from "expo-device"

const MIN_CHUNK_SIZE = 15
const MAX_CHUNK_SIZE = 100

/**
 * Quantos momentos cabem num chunk do feed, em função da capacidade do aparelho.
 *
 * **De onde vinham os dados antes:** `storageKeys().deviceMetadata`, um grupo de chaves que
 * não existe mais no `storageKeys()`. A primeira linha da função lia `.totalMemory` de
 * `undefined`, lançava `TypeError`, caía no próprio `catch` e devolvia `50` — ou seja, as
 * ~120 linhas de score e tiers logo abaixo nunca chegaram a executar uma vez.
 *
 * Agora os sinais vêm do aparelho, ao vivo, como no `calculeCacheMaxSize` ao lado:
 * `expo-device` para memória, `Dimensions`/`PixelRatio` para tela. Todas são chamadas
 * síncronas e sem hook, o que importa porque isto roda no construtor do `ChunkManager`.
 *
 * Bateria, disco livre e modo de economia saíram do cálculo: eram três dos termos do score
 * antigo e nenhum tem fonte síncrona aqui. Preferi um cálculo com menos entradas a um que
 * finge ter dados que não tem — o intervalo de saída continua o mesmo.
 */
export function calculeChunksMaxSize(): number {
    try {
        const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
        const screenArea = screenWidth * screenHeight
        const pixelDensity = PixelRatio.get()
        const fontScale =
            typeof PixelRatio.getFontScale === "function" ? PixelRatio.getFontScale() : 1
        const totalMemory = typeof Device.totalMemory === "number" ? Device.totalMemory : 0

        const isTablet =
            (Device.modelName?.toLowerCase?.().includes("ipad") ?? false) ||
            (Device.deviceName?.toLowerCase?.().includes("tablet") ?? false) ||
            Math.min(screenWidth, screenHeight) >= 600

        // Tamanho base pela RAM, com os mesmos degraus do score antigo. Sem leitura de
        // memória, a área da tela é o proxy — é o que o fallback original já fazia.
        const baseChunksSize = (() => {
            if (totalMemory > 0) {
                const totalMemoryGB = totalMemory / (1024 * 1024 * 1024)
                if (totalMemoryGB >= 12) return 80
                if (totalMemoryGB >= 8) return 70
                if (totalMemoryGB >= 6) return 60
                if (totalMemoryGB >= 4) return 50
                return 35
            }

            if (isTablet) return 70
            if (screenArea > 2400000) return 60
            if (screenArea > 1800000) return 50
            return 35
        })()

        const screenFactor = screenArea > 0 ? Math.min(screenArea / (1920 * 1080), 1.8) : 1
        const tabletFactor = isTablet ? 1.3 : 1
        const densityFactor = Math.max(0.6, 1.8 - (pixelDensity - 1) * 0.2)
        const fontScaleFactor = fontScale > 1.5 ? 0.85 : 1

        const finalSize = Math.floor(
            baseChunksSize * screenFactor * tabletFactor * densityFactor * fontScaleFactor,
        )

        return Math.max(MIN_CHUNK_SIZE, Math.min(MAX_CHUNK_SIZE, finalSize))
    } catch (error) {
        console.warn("Erro ao calcular chunks max size:", error)
        return 50 // Valor padrão seguro
    }
}
