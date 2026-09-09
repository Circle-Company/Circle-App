/**
 * Tudo o que as telas de detalhe de um momento (`/moment/[id]` e
 * `/profile/moment/[momentId]`) compartilham: o carregamento (`useMomentDetail`), a
 * adaptação do payload e as partes visuais que eram idênticas nas duas.
 *
 * O que sobra em cada tela é só o que realmente as distingue — de onde vem a semente, a
 * navegação de volta e, no perfil, o teclado com o input de comentário.
 */
export { MomentAuthorHeader, MomentBottomGradient } from "./moment-card-chrome"
export { MomentComments } from "./moment-comments"
export { pickMomentUser, seedFromListItem, toMomentData } from "./moment-detail.adapters"
export { MomentUnavailable } from "./moment-unavailable"
export { useMomentDetail } from "./useMomentDetail"
export type { MomentDetailState } from "./useMomentDetail"
