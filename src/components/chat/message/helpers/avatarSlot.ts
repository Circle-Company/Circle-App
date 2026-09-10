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

/** Lado em que o avatar fica: o mesmo lado da bolha. */
export function avatarSide(options: MessageOptionsProps): "left" | "right" {
    return options.isMine ? "right" : "left"
}
