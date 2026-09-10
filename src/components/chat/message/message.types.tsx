import React from "react"

/** Direção da bolha: quem enviou a mensagem. */
export type MessageDirection = "sent" | "received"

/** Ciclo de vida do envio — alimenta os tiques ao lado da hora. */
export type MessageDeliveryStatus = "pending" | "sent" | "delivered" | "read" | "failed"

/**
 * Tipo do conteúdo. `system` cobre os avisos centralizados do chat
 * ("Rafael entrou no grupo"), que não são bolha nem têm autor.
 */
export type MessageContentType = "text" | "image" | "video" | "audio" | "document" | "system"

export type MessageAuthorProps = {
    id: string
    username: string
    name: string | null
    profilePicture: string | null
    /** Cor determinística usada no nome do autor em conversas de grupo. */
    color?: string
    verified?: boolean
}

/** Trecho citado quando a mensagem é uma resposta a outra. */
export type MessageReplyProps = {
    id: string
    author: MessageAuthorProps
    preview: string
    contentType: MessageContentType
    edited?: boolean
}

/**
 * Forma do anexo. Os componentes de mídia ainda não existem — o campo fica no
 * modelo para o provider já saber distinguir os tipos de conteúdo (e desabilitar
 * "Copiar" fora de texto, por exemplo).
 */
export type MessageMediaProps = {
    url: string
    width?: number
    height?: number
    /** Duração em segundos — áudio e vídeo. */
    duration?: number
    /** Amplitudes normalizadas (0..1) para a waveform do áudio. */
    waveform?: number[]
    /** Documentos. */
    fileName?: string
    fileSize?: number
    pageCount?: number
    mimeType?: string
    thumbnailUrl?: string
}

export type MessageMentionProps = {
    /** Índices sobre o texto cru, para destacar sem reprocessar a string. */
    start: number
    end: number
    userId: string
    username: string
}

export type MessageReactionProps = {
    emoji: string
    count: number
    /** Se o usuário logado faz parte dessa reação. */
    reactedByMe: boolean
}

export type MessageReciveDataProps = {
    id: string
    chatId: string
    author: MessageAuthorProps
    contentType: MessageContentType
    /** Texto da mensagem ou legenda da mídia. */
    content: string | null
    media?: MessageMediaProps
    mentions?: MessageMentionProps[]
    reactions?: MessageReactionProps[]
    replyTo?: MessageReplyProps | null
    status: MessageDeliveryStatus
    createdAt: string
    editedAt?: string | null
    deletedAt?: string | null
    forwarded?: boolean
    pinned?: boolean
    /**
     * Quantas mensagens responderam a esta.
     *
     * Vem do backend: a lista carregada na tela é uma janela da conversa, e
     * contar as respostas ali daria números diferentes conforme a rolagem.
     */
    replyCount?: number
}

export type MessageOptionsProps = {
    /** Formato a renderizar, derivado do `data` ou forçado por quem renderiza. */
    messageType: MessageType
    /** A mensagem é do usuário logado. */
    isMine: boolean
    /** Conversa em grupo — habilita avatar e nome do autor. */
    isGroup: boolean
    /** Primeira/última de uma sequência do mesmo autor: controla avatar e cantos. */
    isFirstOfGroup: boolean
    isLastOfGroup: boolean
    /** A mensagem logo acima é uma nota de voz do mesmo autor — pede mais respiro. */
    followsAudio: boolean
    /**
     * É a mensagem mais recente da conversa.
     *
     * Quem sabe disso é a lista, não a mensagem. Serve para o "lida" não se
     * repetir conversa acima: uma vez que chegou mensagem nova, saber que a de
     * dez atrás foi lida não acrescenta nada.
     */
    isLatest: boolean
    /** Selecionada pelo menu de ações (long press). */
    isSelected: boolean
    enableReply: boolean
    enableForward: boolean
    enableCopy: boolean
    enableEdit: boolean
    enablePin: boolean
    enableDelete: boolean
    enableReactions: boolean
}

export type MessageActionType =
    | "REPLY"
    | "FORWARD"
    | "COPY"
    | "EDIT"
    | "PIN"
    | "UNPIN"
    | "DELETE"
    | "REACT"
    | "UNREACT"
    | "RETRY"

export type MessageActionPayloadMap = {
    REPLY: { messageId: string }
    FORWARD: { messageId: string }
    COPY: { messageId: string }
    EDIT: { messageId: string; content: string }
    PIN: { messageId: string }
    UNPIN: { messageId: string }
    DELETE: { messageId: string; forEveryone?: boolean }
    REACT: { messageId: string; emoji: string }
    UNREACT: { messageId: string; emoji: string }
    RETRY: { messageId: string }
}

export type MessageActionPayload<T extends MessageActionType> = MessageActionPayloadMap[T]

export type MessageSizeProps = {
    /** Largura máxima da bolha, em fração da largura da tela. */
    maxWidthRatio: number
    padding: number
    borderRadius: number
    /** Raio reduzido no canto "colado" na sequência do mesmo autor. */
    borderRadiusTight: number
    avatarSize: number
    gap: number
    fontSize: number
}

/**
 * O que quem renderiza a mensagem decide sobre ela.
 *
 * Vem agrupado num objeto só, e não como quatro props soltas na `Root`: o resto
 * das `MessageOptionsProps` (as permissões) é **derivado** no provider a partir
 * da sessão e do conteúdo. Separar o que é decidido de fora do que é decidido
 * dentro deixa claro o que a tela pode mesmo controlar.
 */
export type MessageOptionsInput = {
    /**
     * Força o formato. Normalmente omitido: o provider deriva do `data`, e só
     * quem tem caso especial (uma prévia, por exemplo) precisa impor.
     */
    messageType?: MessageType
    /**
     * Quem é o autor, decidido de fora.
     *
     * Normalmente omitido: o provider compara o autor com a sessão, que é a resposta certa
     * numa conversa de verdade. Serve para quem tem outra fonte de identidade — dados de
     * exemplo, uma prévia, ou um SDK cujo id de usuário não é o mesmo da sessão do app.
     */
    isMine?: boolean
    /** Conversa em grupo — habilita avatar e nome do autor. */
    isGroup?: boolean
    /** Posição na sequência do mesmo autor: controla avatar e cantos da bolha. */
    isFirstOfGroup?: boolean
    isLastOfGroup?: boolean
    /**
     * A mensagem logo acima é uma nota de voz do mesmo autor.
     *
     * Chega de fora porque só quem enxerga os vizinhos sabe — a lista resolve isso junto da
     * sequência (`resolveSequence`).
     */
    followsAudio?: boolean
    /** É a mensagem mais recente da conversa — ver `MessageOptionsProps.isLatest`. */
    isLatest?: boolean
    /** Selecionada pelo menu de ações (long press). */
    isSelected?: boolean
}

export type MessageProviderProps = {
    children: React.ReactNode
    data: MessageReciveDataProps
    options?: MessageOptionsInput
    size?: MessageSizeProps
}

/* ---------- Props dos componentes ---------- */

export type MessageChildrenProps = {
    children: React.ReactNode
}

export type MessageContainerProps = {
    children: React.ReactNode
    /**
     * Avatar do autor, renderizado à esquerda da bolha.
     *
     * Chega pronto de fora porque o avatar é um componente do app, não do chat:
     * a mensagem só decide *onde* ele entra, *quando* aparece (grupo, última da
     * sequência) e reserva o espaço dele nas demais linhas.
     */
    avatar?: React.ReactNode
    backgroundColor?: string
}

export type MessageTextProps = {
    /** Sobrescreve o texto da mensagem. Usado pela lápide de mensagem apagada. */
    content?: string
    color?: string
    fontSize?: number
    fontFamily?: string
}

export type MessageAuthorNameProps = {
    color?: string
    fontSize?: number
}

export type MessageReplyPreviewProps = {
    /** Cor de destaque do nome do autor citado. */
    accentColor?: string
    /** Toque na citação, para saltar até a mensagem original. */
    onPress?: () => void
}

export type MessageTimeProps = {
    color?: string
    fontSize?: number
}

export type MessageStatusProps = {
    color?: string
    size?: number
}

export type MessageEditedLabelProps = {
    color?: string
    fontSize?: number
}

export type MessageForwardedLabelProps = {
    color?: string
    fontSize?: number
}

export type MessageRepliesProps = {
    color?: string
    fontSize?: number
    /** Toque para abrir as respostas. */
    onPress?: () => void
}

export type MessageReactionsProps = {
    onPressReaction?: (emoji: string) => void
}

export type MessageActionsMenuProps = {
    /** A bolha, que vira o gatilho do long press. */
    children: React.ReactNode
    onAction?: (action: MessageActionType) => void
}

export type MessageAudioProps = {
    /**
     * Arrastar (ou tocar) o traço para mudar a posição da reprodução.
     *
     * O componente não guarda a posição: ele avisa e espera o `progress` voltar
     * atualizado. Quem manda no player é a tela, e um estado interno aqui
     * brigaria com o que o player reporta.
     */
    onSeek?: (progress: number) => void
    /** Toque no botão de play: alterna entre tocar e pausar esta nota. */
    onTogglePlay?: () => void
    /** Quantidade de barras da waveform. Fixa por padrão — ver `WAVEFORM_BAR_COUNT`. */
    barCount?: number
    /** Altura útil do traço, em px. Default: a altura do avatar do preset. */
    height?: number
    /** Progresso da reprodução (0..1), usado para colorir as barras já tocadas. */
    progress?: number
    /**
     * Tocando agora.
     *
     * Com isto (e a duração no `media`) o traço corre sozinho até o fim e só se
     * corrige quando o player reporta desvio — em vez de reiniciar a animação a
     * cada aviso, que é o que faz o desenho engasgar.
     */
    isPlaying?: boolean
}

/**
 * Formato de renderização da mensagem.
 *
 * `deleted` não é um tipo de conteúdo do backend — é um estado (`deletedAt`) que
 * vence qualquer tipo: uma nota de voz apagada é uma lápide, não um player sem
 * arquivo. Por isso ele mora aqui, e não no `MessageContentType`.
 */
export type MessageType = "text" | "audio" | "deleted"

export type MessageRenderProps = {
    data: MessageReciveDataProps
    /**
     * Formato a renderizar. Quando omitido é derivado do próprio `data` — a lista
     * do chat costuma deixar por conta do componente, e só quem tem um caso
     * especial (uma prévia, por exemplo) precisa forçar.
     */
    messageType?: MessageType
    options?: MessageOptionsInput
    size?: MessageSizeProps
    /** Avatar pronto, vindo de fora do chat — ver `Message.Container`. */
    avatar?: React.ReactNode
    /** Progresso da reprodução da nota de voz (0..1). O player é da tela. */
    progress?: number
    /** A nota de voz está tocando — ver `MessageAudioProps.isPlaying`. */
    isPlaying?: boolean
    onAction?: (action: MessageActionType, messageId: string) => void
    onPressReaction?: (emoji: string) => void
    /** Toque na citação, para saltar até a mensagem original. */
    onPressReply?: (replyToId: string) => void
    /** Toque em "X respostas", para abrir as respostas àquela mensagem. */
    onPressReplies?: (messageId: string) => void
    /** Arrasto no traço da nota de voz — ver `MessageAudioProps.onSeek`. */
    onSeek?: (progress: number) => void
    /** Play/pause da nota de voz. */
    onTogglePlay?: (messageId: string) => void
}
