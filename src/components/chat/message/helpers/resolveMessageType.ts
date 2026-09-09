import { MessageReciveDataProps, MessageType } from "../message.types"

/**
 * Deriva o formato de renderização a partir dos dados da mensagem.
 *
 * `deletedAt` vem antes do tipo de conteúdo de propósito: uma nota de voz
 * apagada é uma lápide, não um player sem arquivo.
 *
 * Imagem, vídeo e documento caem em `text` enquanto não há componente de mídia
 * para eles — ao menos a legenda e o rodapé aparecem, em vez de a mensagem
 * sumir da conversa.
 */
export function resolveMessageType(data: MessageReciveDataProps): MessageType {
    if (data.deletedAt) return "deleted"
    if (data.contentType === "audio") return "audio"
    return "text"
}
