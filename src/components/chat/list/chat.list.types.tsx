import React from "react"

import { MessageReciveDataProps, MessageSizeProps } from "../message/message.types"

/**
 * Marcadores que a lista intercala entre as mensagens.
 *
 * Ficam como linhas da mesma lista, e não como decoração de uma mensagem: quem
 * decide onde o dia vira, ou onde entra um aviso do sistema, é a conversa.
 */
export type ChatDivider =
    { kind: "date"; id: string; label: string } | { kind: "system"; id: string; text: string }

export type ChatRow = MessageReciveDataProps | ChatDivider

export const isDivider = (row: ChatRow): row is ChatDivider => "kind" in row

/** Posição da mensagem na sequência do mesmo autor, resolvida pela lista. */
export type ChatSequence = {
    isFirstOfGroup: boolean
    isLastOfGroup: boolean
}

export type ChatListProps = {
    rows: ChatRow[]
    /** Conversa em grupo: habilita nome do autor e avatar. */
    isGroup?: boolean
    size?: MessageSizeProps
    /** Avatar do autor, montado pela tela — o chat não conhece o componente. */
    renderAvatar?: (message: MessageReciveDataProps) => React.ReactNode
    onAction?: (action: string, messageId: string) => void
    onPressReply?: (replyToId: string) => void
    onPressReaction?: (messageId: string, emoji: string) => void
    onSeek?: (messageId: string, progress: number) => void
    /** Id da nota de voz tocando agora, se houver. */
    playingMessageId?: string
    /** Progresso da nota de voz em reprodução (0..1). */
    playingProgress?: number
}
