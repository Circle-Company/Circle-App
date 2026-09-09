import { describe, expect, it } from "vitest"

import { fft, hannWindow, isPowerOfTwo, magnitudeSpectrum, nextPowerOfTwo } from "../fft"

/** Senoide de `frequency` bins exatos dentro de uma janela de `size` amostras. */
function sineAtBin(size: number, bin: number, amplitude = 1): Float64Array {
    const samples = new Float64Array(size)
    for (let i = 0; i < size; i++) {
        samples[i] = amplitude * Math.sin((2 * Math.PI * bin * i) / size)
    }
    return samples
}

describe("nextPowerOfTwo / isPowerOfTwo", () => {
    it("arredonda para cima para a próxima potência de 2", () => {
        expect(nextPowerOfTwo(1)).toBe(1)
        expect(nextPowerOfTwo(3)).toBe(4)
        expect(nextPowerOfTwo(64)).toBe(64)
        expect(nextPowerOfTwo(65)).toBe(128)
    })

    it("reconhece potências de 2", () => {
        expect(isPowerOfTwo(1)).toBe(true)
        expect(isPowerOfTwo(1024)).toBe(true)
        expect(isPowerOfTwo(0)).toBe(false)
        expect(isPowerOfTwo(6)).toBe(false)
    })
})

describe("fft", () => {
    it("rejeita comprimento que não é potência de 2", () => {
        expect(() => fft(new Float64Array(6), new Float64Array(6))).toThrow(/potência de 2/)
    })

    it("rejeita partes real e imaginária de comprimentos diferentes", () => {
        expect(() => fft(new Float64Array(4), new Float64Array(8))).toThrow(/mesmo comprimento/)
    })

    it("transforma um impulso num espectro plano", () => {
        // A FFT de δ[n] é 1 em todos os bins — o teste mais direto das borboletas.
        const real = new Float64Array(8)
        real[0] = 1
        const imag = new Float64Array(8)

        fft(real, imag)

        for (let i = 0; i < 8; i++) {
            expect(real[i]).toBeCloseTo(1, 10)
            expect(imag[i]).toBeCloseTo(0, 10)
        }
    })

    it("concentra a energia de uma senoide no bin correspondente", () => {
        const spectrum = magnitudeSpectrum(sineAtBin(64, 8))

        const peakBin = spectrum.indexOf(Math.max(...Array.from(spectrum)))
        expect(peakBin).toBe(8)

        // Os demais bins ficam praticamente zerados: a frequência cai exatamente
        // sobre um bin, então não há vazamento.
        spectrum.forEach((magnitude, bin) => {
            if (bin !== 8) expect(magnitude).toBeLessThan(1e-9)
        })
    })

    it("mantém a energia entre tempo e frequência (Parseval)", () => {
        const samples = sineAtBin(128, 5, 0.7)
        const spectrum = magnitudeSpectrum(samples)

        const timeEnergy = samples.reduce((sum, value) => sum + value * value, 0)
        // O espectro devolvido é metade do plano; a outra metade é espelho.
        const freqEnergy =
            (2 * spectrum.reduce((sum, value) => sum + value * value, 0)) / samples.length

        expect(freqEnergy).toBeCloseTo(timeEnergy, 6)
    })
})

describe("hannWindow", () => {
    it("começa e termina em zero, com o pico no centro", () => {
        // Tamanho ímpar: só assim uma amostra cai exatamente no centro e vale 1.
        // Em janela par o máximo fica logo abaixo disso, e é o esperado.
        const odd = hannWindow(9)
        expect(odd[0]).toBeCloseTo(0, 10)
        expect(odd[8]).toBeCloseTo(0, 10)
        expect(odd[4]).toBeCloseTo(1, 10)

        const even = hannWindow(8)
        expect(even[0]).toBeCloseTo(0, 10)
        expect(even[7]).toBeCloseTo(0, 10)
        expect(Math.max(...Array.from(even))).toBeLessThanOrEqual(1)
        expect(Math.max(...Array.from(even))).toBeGreaterThan(0.9)
    })

    it("é simétrica", () => {
        const window = hannWindow(16)
        for (let i = 0; i < 8; i++) {
            expect(window[i]).toBeCloseTo(window[15 - i], 10)
        }
    })

    it("trata a janela de uma amostra sem dividir por zero", () => {
        expect(Array.from(hannWindow(1))).toEqual([1])
    })
})
