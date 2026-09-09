/**
 * Decodificador de WAV (RIFF/PCM) para amostras mono normalizadas em -1..1.
 *
 * Só WAV: formatos comprimidos (m4a, mp3, opus) precisam de decodificador
 * nativo, que não existe em JS a um custo aceitável dentro da lista do chat.
 * Para eles o caminho é a waveform pré-calculada que vem no `media.waveform` —
 * ver `useWaveform`.
 */

export type DecodedAudio = {
    samples: Float32Array
    sampleRate: number
    channels: number
}

const FORMAT_PCM = 1
const FORMAT_IEEE_FLOAT = 3
const FORMAT_EXTENSIBLE = 0xfffe

/** Lê um FourCC ("RIFF", "fmt ", "data") sem alocar via TextDecoder. */
function readTag(view: DataView, offset: number): string {
    return String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3),
    )
}

export function decodeWav(bytes: Uint8Array): DecodedAudio {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

    if (bytes.byteLength < 12 || readTag(view, 0) !== "RIFF" || readTag(view, 8) !== "WAVE") {
        throw new Error("decodeWav: o arquivo não é um RIFF/WAVE")
    }

    let format = 0
    let channels = 0
    let sampleRate = 0
    let bitsPerSample = 0
    let dataOffset = -1
    let dataLength = 0

    // Percorre os chunks: a ordem não é garantida e podem existir chunks
    // extras (LIST, fact) entre o `fmt ` e o `data`.
    let cursor = 12
    while (cursor + 8 <= bytes.byteLength) {
        const tag = readTag(view, cursor)
        const size = view.getUint32(cursor + 4, true)
        const body = cursor + 8

        if (tag === "fmt ") {
            format = view.getUint16(body, true)
            channels = view.getUint16(body + 2, true)
            sampleRate = view.getUint32(body + 4, true)
            bitsPerSample = view.getUint16(body + 14, true)

            // No WAVE_FORMAT_EXTENSIBLE o formato real fica no GUID, cujos
            // dois primeiros bytes repetem o código clássico.
            if (format === FORMAT_EXTENSIBLE && size >= 40) {
                format = view.getUint16(body + 24, true)
            }
        } else if (tag === "data") {
            dataOffset = body
            dataLength = Math.min(size, bytes.byteLength - body)
        }

        // Chunks têm padding para tamanho par.
        cursor = body + size + (size % 2)
    }

    if (dataOffset < 0 || !channels || !sampleRate || !bitsPerSample) {
        throw new Error("decodeWav: chunks `fmt ` ou `data` ausentes")
    }
    if (format !== FORMAT_PCM && format !== FORMAT_IEEE_FLOAT) {
        throw new Error(`decodeWav: formato não suportado (${format})`)
    }

    const bytesPerSample = bitsPerSample / 8
    const frameCount = Math.floor(dataLength / (bytesPerSample * channels))
    const samples = new Float32Array(frameCount)

    for (let frame = 0; frame < frameCount; frame++) {
        // Mixdown para mono: a waveform é um desenho de volume, e manter os
        // canais separados só duplicaria o custo para o mesmo traço.
        let sum = 0
        for (let channel = 0; channel < channels; channel++) {
            const offset = dataOffset + (frame * channels + channel) * bytesPerSample
            sum += readSample(view, offset, bitsPerSample, format)
        }
        samples[frame] = sum / channels
    }

    return { samples, sampleRate, channels }
}

/** Lê uma amostra e normaliza para -1..1 conforme a profundidade de bits. */
function readSample(view: DataView, offset: number, bitsPerSample: number, format: number): number {
    if (format === FORMAT_IEEE_FLOAT) {
        return bitsPerSample === 64 ? view.getFloat64(offset, true) : view.getFloat32(offset, true)
    }

    switch (bitsPerSample) {
        // 8 bits em WAV é *unsigned*, com o silêncio em 128 — não em 0.
        case 8:
            return (view.getUint8(offset) - 128) / 128
        case 16:
            return view.getInt16(offset, true) / 32768
        case 24: {
            const value =
                view.getUint8(offset) |
                (view.getUint8(offset + 1) << 8) |
                (view.getInt8(offset + 2) << 16)
            return value / 8388608
        }
        case 32:
            return view.getInt32(offset, true) / 2147483648
        default:
            throw new Error(`decodeWav: profundidade não suportada (${bitsPerSample} bits)`)
    }
}

/** Converte o base64 devolvido pelo `expo-file-system` em bytes. */
export function base64ToBytes(base64: string): Uint8Array {
    const binary = globalThis.atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
}
