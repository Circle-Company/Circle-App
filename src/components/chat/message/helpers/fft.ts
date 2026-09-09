/**
 * Transformada rápida de Fourier — Cooley-Tukey radix-2, iterativa e in-place.
 *
 * Iterativa (e não recursiva) porque a waveform de uma nota de voz roda dezenas
 * de janelas por mensagem: a versão recursiva aloca dois arrays por nível de
 * recursão, e isso apareceria como GC no meio da rolagem da lista.
 */

/** Maior potência de 2 menor ou igual a `value`. */
export function previousPowerOfTwo(value: number): number {
    if (value < 1) return 0
    return 2 ** Math.floor(Math.log2(value))
}

/** Menor potência de 2 maior ou igual a `value`. */
export function nextPowerOfTwo(value: number): number {
    if (value <= 1) return 1
    return 2 ** Math.ceil(Math.log2(value))
}

export function isPowerOfTwo(value: number): boolean {
    return value > 0 && (value & (value - 1)) === 0
}

/**
 * FFT complexa in-place. `real` e `imag` têm o mesmo comprimento, que precisa
 * ser potência de 2 — o radix-2 não sabe fatorar outro tamanho, e falhar aqui
 * é melhor do que devolver um espectro silenciosamente errado.
 */
export function fft(real: Float64Array, imag: Float64Array): void {
    const size = real.length

    if (size !== imag.length) {
        throw new Error("fft: `real` e `imag` precisam ter o mesmo comprimento")
    }
    if (!isPowerOfTwo(size)) {
        throw new Error(`fft: o comprimento precisa ser potência de 2 (recebido ${size})`)
    }
    if (size === 1) return

    // 1. Permutação bit-reversa: reordena a entrada para que as borboletas
    //    abaixo possam ler pares adjacentes.
    for (let i = 1, j = 0; i < size; i++) {
        let bit = size >> 1
        for (; j & bit; bit >>= 1) j ^= bit
        j ^= bit

        if (i < j) {
            const tempReal = real[i]
            real[i] = real[j]
            real[j] = tempReal

            const tempImag = imag[i]
            imag[i] = imag[j]
            imag[j] = tempImag
        }
    }

    // 2. Borboletas, dobrando o comprimento do bloco a cada nível.
    for (let length = 2; length <= size; length <<= 1) {
        const angle = (-2 * Math.PI) / length
        const stepReal = Math.cos(angle)
        const stepImag = Math.sin(angle)

        for (let start = 0; start < size; start += length) {
            // Fator de rotação, avançado por multiplicação em vez de um
            // `cos`/`sin` por amostra.
            let twiddleReal = 1
            let twiddleImag = 0

            for (let offset = 0; offset < length / 2; offset++) {
                const even = start + offset
                const odd = even + length / 2

                const oddReal = real[odd] * twiddleReal - imag[odd] * twiddleImag
                const oddImag = real[odd] * twiddleImag + imag[odd] * twiddleReal

                real[odd] = real[even] - oddReal
                imag[odd] = imag[even] - oddImag
                real[even] += oddReal
                imag[even] += oddImag

                const nextTwiddleReal = twiddleReal * stepReal - twiddleImag * stepImag
                twiddleImag = twiddleReal * stepImag + twiddleImag * stepReal
                twiddleReal = nextTwiddleReal
            }
        }
    }
}

/**
 * Espectro de magnitude de um sinal real.
 *
 * Devolve apenas os `size / 2` primeiros bins: para entrada real o resto é
 * espelho e não carrega informação nova.
 */
export function magnitudeSpectrum(samples: Float64Array): Float64Array {
    const size = samples.length
    const real = Float64Array.from(samples)
    const imag = new Float64Array(size)

    fft(real, imag)

    const bins = new Float64Array(size / 2)
    for (let i = 0; i < bins.length; i++) {
        bins[i] = Math.hypot(real[i], imag[i])
    }
    return bins
}

/**
 * Janela de Hann.
 *
 * Sem janela, cortar o áudio em blocos cria descontinuidades nas bordas que a
 * FFT lê como energia de alta frequência (vazamento espectral) — e a waveform
 * sai com barras altas onde só há silêncio.
 */
export function hannWindow(size: number): Float64Array {
    const window = new Float64Array(size)
    if (size === 1) {
        window[0] = 1
        return window
    }
    for (let i = 0; i < size; i++) {
        window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)))
    }
    return window
}
