import type {
    MessageDeliveryStatus,
    MessageOptionsProps,
    MessageReciveDataProps,
} from "../message.types"

/**
 * O que o rodapé da mensagem tem a dizer — se é que tem alguma coisa.
 *
 * As três regras moram aqui, e não só dentro de cada componente, porque o **rodapé** precisa
 * saber de antemão se vai sobrar algo para mostrar. Sem isso ele desenhava a caixa mesmo
 * quando os três filhos devolviam `null`: uma view vazia com margem e padding vertical, ou
 * seja, um vão invisível abaixo de toda mensagem que fecha um bloco sem ter estado de envio
 * nem edição — na prática, quase toda mensagem recebida. O bloco vizinho, com "lido" no
 * rodapé, ocupava o mesmo espaço com conteúdo. É isso que aparecia como espaçamento
 * inconsistente entre as mensagens.
 *
 * Cada componente do rodapé também usa a função que lhe cabe, para as duas decisões não
 * poderem divergir: se o rodapé acha que vai aparecer algo, aparece mesmo.
 */

/** Respostas que esta mensagem recebeu. Apagada não convida a abrir a discussão. */
export const showsReplies = (data: MessageReciveDataProps, options: MessageOptionsProps) =>
    (data.replyCount ?? 0) > 0 && options.messageType !== "deleted"

/** Marca "editada". */
export const showsEdited = (data: MessageReciveDataProps, options: MessageOptionsProps) =>
    !!data.editedAt && options.messageType !== "deleted"

/**
 * Estado de entrega.
 *
 * Só nas minhas — o estado de leitura de uma recebida não existe do lado de cá — e "lida" só
 * na mais recente, para não se repetir conversa acima.
 */
export const showsStatus = (options: MessageOptionsProps, status: MessageDeliveryStatus) =>
    options.isMine && (status !== "read" || options.isLatest)

/** Alguma das três aparece. */
export const hasFooterContent = (
    data: MessageReciveDataProps,
    options: MessageOptionsProps,
    status: MessageDeliveryStatus,
) => showsReplies(data, options) || showsEdited(data, options) || showsStatus(options, status)
