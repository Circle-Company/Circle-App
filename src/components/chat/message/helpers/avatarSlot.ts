import { MessageOptionsProps } from "../message.types"

/**
 * Quando a linha reserva espaço para o avatar, e de que lado.
 *
 * Duas regras diferentes convivem aqui, e é por isso que a decisão fica num
 * lugar só — container, rodapé e reações precisam concordar sobre ela, e três
 * cópias divergiriam no primeiro ajuste:
 *
 * 1. **Grupo**: o avatar identifica quem falou, então aparece nas mensagens dos
 *    outros. Nas minhas não: já sei que sou eu.
 * 2. **Nota de voz**: aparece dos dois lados, inclusive na conversa de dois. Uma
 *    bolha de áudio não tem texto para dar contexto — o rosto é o que diz de
 *    quem é a voz antes de apertar o play.
 */
export function hasAvatarSlot(options: MessageOptionsProps): boolean {
    if (options.messageType === "audio") return true
    return options.isGroup && !options.isMine
}

/**
 * Quando o avatar é de fato **desenhado** no vão reservado.
 *
 * Reservar e desenhar são decisões diferentes: numa sequência do mesmo autor o vão fica de
 * pé em todas as mensagens, para as bolhas ficarem na mesma coluna, mas o rosto só aparece
 * na última — repeti-lo em cada linha do bloco é ruído.
 *
 * A nota de voz é a exceção, pela mesma razão que ela sempre reserva o vão: sem texto para
 * dar contexto, o rosto é o que diz de quem é a voz antes de apertar o play. Um áudio no
 * meio de um bloco ficava com o vão reservado e vazio — que é como se o avatar não
 * existisse.
 */
export function drawsAvatar(options: MessageOptionsProps): boolean {
    if (!hasAvatarSlot(options)) return false
    return options.messageType === "audio" || options.isLastOfGroup
}

/** Lado em que o avatar fica: o mesmo lado da bolha. */
export function avatarSide(options: MessageOptionsProps): "left" | "right" {
    return options.isMine ? "right" : "left"
}
