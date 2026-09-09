import { hannWindow, magnitudeSpectrum, nextPowerOfTwo } from "./fft"

/**
 * Número fixo de barras da waveform.
 *
 * É fixo de propósito: a bolha de áudio tem largura constante, então a
 * quantidade de barras não pode depender da duração — senão uma nota de 3s e
 * uma de 2min desenhariam densidades diferentes no mesmo espaço.
 */
export const WAVEFORM_BAR_COUNT = 28

/** Piso de altura (0..1): barra nenhuma some por completo, mesmo no silêncio. */
export const WAVEFORM_MIN_BAR = 0.08

/** Faixa dinâmica considerada, em dB. Abaixo disso é tratado como silêncio. */
const DYNAMIC_RANGE_DB = 55

/** Teto do tamanho da janela de FFT: acima disso o custo não melhora o desenho. */
const MAX_FFT_SIZE = 1024
const MIN_FFT_SIZE = 32

export type WaveformOptions = {
    /** Quantidade de barras a produzir. */
    barCount?: number
    /**
     * Taxa de amostragem, usada para limitar a análise à banda da voz. Sem ela
     * o espectro inteiro é considerado.
     */
    sampleRate?: number
    /** Banda analisada, em Hz. O default cobre a voz humana. */
    minFrequency?: number
    maxFrequency?: number
}

/**
 * Deriva `barCount` alturas normalizadas (0..1) a partir das amostras PCM mono.
 *
 * O caminho é uma STFT: o sinal é cortado em `barCount` janelas, cada janela
 * passa por Hann + FFT, e a barra recebe a **energia do espectro** daquela
 * janela — não o pico da amostra. A diferença importa: o pico reage a um
 * estalo isolado, enquanto a energia espectral acompanha o que o ouvido lê como
 * volume, que é o que a waveform de uma nota de voz precisa mostrar.
 *
 * A escala final é logarítmica (dB) porque a percepção de volume também é: em
 * escala linear a fala normal ocuparia a faixa de baixo do desenho e só um grito
 * encostaria no topo.
 */
export function calculeWaveformBars(
    samples: Float32Array | Float64Array | number[],
    options: WaveformOptions = {},
): number[] {
    const {
        barCount = WAVEFORM_BAR_COUNT,
        sampleRate,
        minFrequency = 80,
        maxFrequency = 4000,
    } = options

    if (barCount <= 0) return []

    const total = samples.length
    // Áudio curto demais para uma STFT honesta: devolve o piso em vez de
    // inventar um desenho a partir de duas amostras.
    if (total < barCount) return new Array(barCount).fill(WAVEFORM_MIN_BAR)

    const hop = Math.floor(total / barCount)
    const fftSize = Math.min(MAX_FFT_SIZE, Math.max(MIN_FFT_SIZE, nextPowerOfTwo(hop)))
    const window = hannWindow(fftSize)
    const frame = new Float64Array(fftSize)

    // Recorte de banda. Fora dela mora ruído de fundo e sibilância, que inflam
    // a energia sem corresponder ao que se ouve como voz.
    const binCount = fftSize / 2
    let firstBin = 1 // bin 0 é o nível DC: offset do microfone, não som.
    let lastBin = binCount - 1
    if (sampleRate && sampleRate > 0) {
        const binWidth = sampleRate / fftSize
        firstBin = Math.max(1, Math.floor(minFrequency / binWidth))
        lastBin = Math.min(binCount - 1, Math.ceil(maxFrequency / binWidth))
        if (lastBin < firstBin) lastBin = firstBin
    }

    const energies = new Float64Array(barCount)

    for (let bar = 0; bar < barCount; bar++) {
        const start = bar * hop

        for (let i = 0; i < fftSize; i++) {
            const index = start + i
            // Zero-padding no fim: a última janela quase nunca fecha redonda.
            frame[i] = index < total ? Number(samples[index]) * window[i] : 0
        }

        const spectrum = magnitudeSpectrum(frame)

        // RMS do espectro dentro da banda — Parseval garante que isso é
        // proporcional à energia da janela no tempo.
        let sum = 0
        for (let bin = firstBin; bin <= lastBin; bin++) {
            sum += spectrum[bin] * spectrum[bin]
        }
        energies[bar] = Math.sqrt(sum / (lastBin - firstBin + 1))
    }

    return normalizeToBars(energies)
}

/**
 * Normaliza as energias para 0..1 numa escala em dB, relativa ao pico da
 * própria mensagem.
 *
 * Relativa ao pico, e não a um valor absoluto, porque o ganho de gravação varia
 * por aparelho: sem isso a mesma frase gravada baixinho viraria uma linha reta.
 */
function normalizeToBars(energies: Float64Array): number[] {
    let peak = 0
    for (let i = 0; i < energies.length; i++) {
        if (energies[i] > peak) peak = energies[i]
    }

    // Silêncio absoluto: nada a normalizar.
    if (peak <= 0) return new Array(energies.length).fill(WAVEFORM_MIN_BAR)

    const bars = new Array<number>(energies.length)
    for (let i = 0; i < energies.length; i++) {
        const ratio = energies[i] / peak
        if (ratio <= 0) {
            bars[i] = WAVEFORM_MIN_BAR
            continue
        }

        const decibels = 20 * Math.log10(ratio) // 0 dB no pico, negativo abaixo.
        const normalized = 1 + decibels / DYNAMIC_RANGE_DB // -55 dB vira 0.
        bars[i] = clamp(normalized, WAVEFORM_MIN_BAR, 1)
    }
    return bars
}

function clamp(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min
    return Math.min(max, Math.max(min, value))
}

/**
 * Reamostra uma waveform já pronta para outra quantidade de barras.
 *
 * Serve para o caso em que o backend manda a waveform calculada (comum quando
 * a nota foi gravada em outro cliente): a quantidade dele não precisa ser a
 * nossa, e recalcular exigiria baixar o áudio inteiro só para desenhar.
 */
export function resampleWaveformBars(bars: number[], barCount = WAVEFORM_BAR_COUNT): number[] {
    if (barCount <= 0) return []
    if (!bars.length) return new Array(barCount).fill(WAVEFORM_MIN_BAR)
    if (bars.length === barCount) return bars.map((bar) => clamp(bar, WAVEFORM_MIN_BAR, 1))

    const resampled = new Array<number>(barCount)
    const ratio = bars.length / barCount

    for (let i = 0; i < barCount; i++) {
        const start = Math.floor(i * ratio)
        const end = Math.max(start + 1, Math.floor((i + 1) * ratio))

        let sum = 0
        let count = 0
        for (let j = start; j < end && j < bars.length; j++) {
            sum += bars[j]
            count++
        }
        resampled[i] = clamp(count ? sum / count : WAVEFORM_MIN_BAR, WAVEFORM_MIN_BAR, 1)
    }
    return resampled
}
