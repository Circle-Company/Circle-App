import { describe, expect, it } from "vitest"

import {
    WAVEFORM_BAR_COUNT,
    WAVEFORM_MIN_BAR,
    calculeWaveformBars,
    resampleWaveformBars,
} from "../calculeWaveformBars"

const SAMPLE_RATE = 16000

/** Tom senoidal de `frequency` Hz e amplitude constante. */
function tone(seconds: number, frequency = 440, amplitude = 1): Float32Array {
    const total = Math.floor(seconds * SAMPLE_RATE)
    const samples = new Float32Array(total)
    for (let i = 0; i < total; i++) {
        samples[i] = amplitude * Math.sin((2 * Math.PI * frequency * i) / SAMPLE_RATE)
    }
    return samples
}

describe("calculeWaveformBars", () => {
    it("devolve sempre a quantidade fixa de barras, qualquer que seja a duração", () => {
        const short = calculeWaveformBars(tone(0.5), { sampleRate: SAMPLE_RATE })
        const long = calculeWaveformBars(tone(30), { sampleRate: SAMPLE_RATE })

        expect(short).toHaveLength(WAVEFORM_BAR_COUNT)
        expect(long).toHaveLength(WAVEFORM_BAR_COUNT)
    })

    it("respeita um `barCount` explícito", () => {
        expect(calculeWaveformBars(tone(2), { barCount: 12 })).toHaveLength(12)
        expect(calculeWaveformBars(tone(2), { barCount: 0 })).toEqual([])
    })

    it("mantém todas as barras dentro de 0..1, acima do piso", () => {
        const bars = calculeWaveformBars(tone(3), { sampleRate: SAMPLE_RATE })

        bars.forEach((bar) => {
            expect(bar).toBeGreaterThanOrEqual(WAVEFORM_MIN_BAR)
            expect(bar).toBeLessThanOrEqual(1)
        })
    })

    it("desenha o silêncio no piso, sem NaN", () => {
        const silence = new Float32Array(SAMPLE_RATE)

        const bars = calculeWaveformBars(silence, { sampleRate: SAMPLE_RATE })

        expect(bars).toHaveLength(WAVEFORM_BAR_COUNT)
        bars.forEach((bar) => expect(bar).toBe(WAVEFORM_MIN_BAR))
    })

    it("acompanha o envelope de volume: trecho alto fica acima do trecho baixo", () => {
        // Primeira metade forte, segunda metade 20x mais fraca.
        const loud = tone(1, 440, 1)
        const quiet = tone(1, 440, 0.05)
        const samples = new Float32Array(loud.length + quiet.length)
        samples.set(loud, 0)
        samples.set(quiet, loud.length)

        const bars = calculeWaveformBars(samples, { sampleRate: SAMPLE_RATE })
        const half = Math.floor(bars.length / 2)
        // Ignora as barras da fronteira, cuja janela pega os dois trechos.
        const loudSide = bars.slice(0, half - 1)
        const quietSide = bars.slice(half + 1)

        expect(Math.min(...loudSide)).toBeGreaterThan(Math.max(...quietSide))
    })

    it("normaliza pelo próprio pico: o mesmo sinal em outro ganho desenha igual", () => {
        const loud = calculeWaveformBars(tone(2, 440, 0.9), { sampleRate: SAMPLE_RATE })
        const quiet = calculeWaveformBars(tone(2, 440, 0.05), { sampleRate: SAMPLE_RATE })

        loud.forEach((bar, index) => expect(bar).toBeCloseTo(quiet[index], 6))
    })

    it("ignora energia fora da banda de voz quando a taxa de amostragem é conhecida", () => {
        // Voz (440 Hz) sozinha, e a mesma voz com um tom forte de 7 kHz somado —
        // acima do `maxFrequency` default (4 kHz). O recorte de banda tem que
        // deixar os dois desenhos praticamente iguais.
        const voice = tone(2, 440, 0.5)
        const polluted = Float32Array.from(voice)
        const noise = tone(2, 7000, 0.9)
        for (let i = 0; i < polluted.length; i++) polluted[i] += noise[i]

        const clean = calculeWaveformBars(voice, { sampleRate: SAMPLE_RATE })
        const dirty = calculeWaveformBars(polluted, { sampleRate: SAMPLE_RATE })

        clean.forEach((bar, index) => expect(dirty[index]).toBeCloseTo(bar, 4))
    })

    it("devolve o piso quando há menos amostras do que barras", () => {
        const bars = calculeWaveformBars(new Float32Array(10), { barCount: 32 })

        expect(bars).toHaveLength(32)
        bars.forEach((bar) => expect(bar).toBe(WAVEFORM_MIN_BAR))
    })

    it("aceita array simples além de Float32Array", () => {
        const samples = Array.from(tone(1))

        expect(calculeWaveformBars(samples, { sampleRate: SAMPLE_RATE })).toHaveLength(
            WAVEFORM_BAR_COUNT,
        )
    })
})

describe("resampleWaveformBars", () => {
    it("reduz para a quantidade pedida", () => {
        const bars = resampleWaveformBars(new Array(100).fill(0.5), 20)

        expect(bars).toHaveLength(20)
        bars.forEach((bar) => expect(bar).toBeCloseTo(0.5, 10))
    })

    it("amplia para a quantidade pedida", () => {
        expect(resampleWaveformBars([0.2, 0.8], 10)).toHaveLength(10)
    })

    it("mantém a lista quando já está no tamanho certo, só limitando a faixa", () => {
        expect(resampleWaveformBars([0, 0.5, 2], 3)).toEqual([WAVEFORM_MIN_BAR, 0.5, 1])
    })

    it("devolve o piso para lista vazia", () => {
        expect(resampleWaveformBars([], 4)).toEqual(new Array(4).fill(WAVEFORM_MIN_BAR))
    })
})
