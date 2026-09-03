import sizes from "@/constants/sizes"

export const ITEM_WIDTH = sizes.moment.standart.width

/** Largura da tela que sobra ao lado do moment. */
const HORIZONTAL_SLACK = sizes.screens.width - ITEM_WIDTH
/**
 * Acima desta folga o moment está visivelmente mais estreito que a tela e os
 * vizinhos deixam de ser uma fatia na borda para virar cards inteiros.
 */
const WIDE_SLACK = 80

/**
 * Espaçamento horizontal entre moments no carrossel.
 *
 * Quando o moment ocupa quase toda a largura, a sobreposição negativa é o que
 * produz o efeito de carrossel: os vizinhos aparecem só como uma fatia colada
 * na borda. Já quando ele precisa encolher para caber na altura — o canvas
 * 375x667 do modo de compatibilidade do iPad, e o iPhone SE/8 — sobra muita
 * largura, os vizinhos aparecem quase inteiros e a sobreposição gruda os cards
 * uns nos outros. Nesse caso o espaçamento vira um respiro positivo.
 */
export const SPACING = HORIZONTAL_SLACK > WIDE_SLACK ? 24 : -20

/** Passo real do carrossel: é o que o snap usa e onde cada item começa. */
export const SNAP_INTERVAL = ITEM_WIDTH + SPACING

/** Padding que centraliza o primeiro item. */
export const INITIAL_PADDING = HORIZONTAL_SLACK / 2
