/**
 * Stub web do `expo-file-system/legacy`.
 *
 * O `useWaveform` tenta ler o arquivo de áudio para derivar a waveform por FFT.
 * No navegador não há esse arquivo: a leitura rejeita, o hook cai no fallback e
 * a barra fica no piso — que é exatamente o estado que a story deve mostrar
 * quando não há áudio real.
 */
export const EncodingType = { Base64: "base64", UTF8: "utf8" } as const

export const readAsStringAsync = async () => {
    throw new Error("expo-file-system indisponível no Storybook web")
}

export const cacheDirectory = "/mock/cache/"
export const documentDirectory = "/mock/documents/"
export const getInfoAsync = async () => ({ exists: false })
export const makeDirectoryAsync = async () => {}
export const readDirectoryAsync = async () => []
export const deleteAsync = async () => {}
