import React from "react"
import * as FileSystem from "expo-file-system/legacy"

import {
    WAVEFORM_BAR_COUNT,
    WAVEFORM_MIN_BAR,
    calculeWaveformBars,
    resampleWaveformBars,
} from "../helpers/calculeWaveformBars"
import { base64ToBytes, decodeWav } from "../helpers/decodeWav"

export type UseWaveformParams = {
    /** Arquivo local ou remoto da nota de voz. */
    uri?: string
    /** Waveform já calculada pelo backend ou por outro cliente. */
    precomputed?: number[]
    barCount?: number
}

export type UseWaveformResult = {
    bars: number[]
    isLoading: boolean
    /** `true` quando o desenho é só o piso — não deu para derivar do áudio. */
    isFallback: boolean
}

/**
 * Resolve as barras da waveform de uma nota de voz.
 *
 * A ordem das fontes é deliberada:
 *   1. `precomputed` — não custa rede nem CPU, e é o caso comum;
 *   2. o próprio arquivo, decodificado e passado pela FFT, **só para WAV**;
 *   3. o piso, quando nenhum dos dois se aplica.
 *
 * O passo 2 é limitado a WAV porque decodificar m4a/opus em JS custaria mais do
 * que a lista do chat pode pagar por mensagem. Quem grava é o app, então a saída
 * de longo prazo é calcular a waveform **uma vez, no envio**, e mandá-la junto —
 * aí o passo 1 cobre tudo.
 *
 * Só o passo 2 usa estado. Os outros dois são derivação pura da entrada, e
 * escrevê-los em `useState` dentro de um efeito custaria um render em cascata a
 * cada mensagem de áudio que entrasse na lista.
 */
export function useWaveform({
    uri,
    precomputed,
    barCount = WAVEFORM_BAR_COUNT,
}: UseWaveformParams): UseWaveformResult {
    const fallback = React.useMemo(() => new Array(barCount).fill(WAVEFORM_MIN_BAR), [barCount])

    const precomputedBars = React.useMemo(
        () => (precomputed?.length ? resampleWaveformBars(precomputed, barCount) : null),
        [precomputed, barCount],
    )

    const shouldDecode = !precomputedBars && !!uri && isWav(uri)

    const [decodedBars, setDecodedBars] = React.useState<number[] | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (!shouldDecode) return

        // Guarda de montagem: a lista do chat recicla linhas, e uma decodificação
        // que termine depois da desmontagem escreveria no estado de outra mensagem.
        let active = true

        async function load() {
            setIsLoading(true)
            try {
                const base64 = await FileSystem.readAsStringAsync(uri as string, {
                    encoding: FileSystem.EncodingType.Base64,
                })
                const { samples, sampleRate } = decodeWav(base64ToBytes(base64))
                const computed = calculeWaveformBars(samples, { barCount, sampleRate })

                if (active) setDecodedBars(computed)
            } catch (error) {
                if (!active) return
                const message = error instanceof Error ? error.message : String(error)
                console.warn("Não foi possível derivar a waveform do áudio:", message)
                setDecodedBars(null)
            } finally {
                if (active) setIsLoading(false)
            }
        }

        load()
        return () => {
            active = false
        }
    }, [shouldDecode, uri, barCount])

    const bars = precomputedBars ?? decodedBars ?? fallback

    return {
        bars,
        isLoading,
        isFallback: !precomputedBars && !decodedBars,
    }
}

function isWav(uri: string): boolean {
    return /\.wav($|\?)/i.test(uri)
}
