/** Geometria das barras, em px. O vão é igual à barra: o traço respira. */
export const BAR_WIDTH = 3
export const BAR_GAP = 3
/** Cantos totalmente arredondados: a barra vira uma cápsula. */
export const BAR_RADIUS = BAR_WIDTH / 2
/** Altura mínima, para a barra não sumir quando o valor está no piso. */
export const BAR_MIN_HEIGHT = 2
/** Opacidade do trecho ainda não reproduzido. */
export const IDLE_OPACITY = 0.35
/** Diâmetro da bolinha que marca o ponto atual da reprodução. */
export const INDICATOR_SIZE = 12

/**
 * Tempo da interpolação entre um `progress` e o seguinte.
 *
 * Um player real reporta posição de tempos em tempos (o `expo-audio` costuma
 * emitir a cada ~200-500ms), não a cada quadro. Sem interpolação o traço andaria
 * em degraus nesse ritmo; com ela o valor recebido vira o *destino*, e a
 * animação preenche o intervalo.
 */
export const SMOOTHING_MS = 320

/**
 * Desvio a partir do qual a reprodução é ressincronizada, em fração da duração.
 *
 * Tocando, a animação vai sozinha até o fim; cada `progress` que chega é só uma
 * conferência. Reiniciar a animação a cada aviso do player (ou a cada quadro, no
 * Storybook) é o que fazia o traço engasgar. 1% de 30s é 0,3s — abaixo disso
 * ninguém vê diferença, e acima disso houve um salto de verdade.
 */
export const RESYNC_THRESHOLD = 0.1

/** Largura total do traço para uma dada quantidade de barras. */
export function trackWidthFor(barCount: number): number {
    return Math.max(0, barCount * (BAR_WIDTH + BAR_GAP) - BAR_GAP)
}

export function clamp(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) return min
    return Math.min(max, Math.max(min, value))
}
