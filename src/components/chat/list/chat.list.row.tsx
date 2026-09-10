import React from "react"
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated"

import ChatListTimestamp from "./chat.list.timestamp"
import { DateSeparator } from "../date.separator"
import { MessageRender } from "../message"
import { SystemMessage } from "../system.message"
import { ChatRow, ChatSequence, isDivider } from "./chat.list.types"
import {
    MessageActionType,
    MessageReciveDataProps,
    MessageSizeProps,
} from "../message/message.types"

export type ChatListRowProps = {
    row: ChatRow
    sequence?: ChatSequence
    isGroup: boolean
    /** De que lado esta bolha fica, quando a lista sabe quem está lendo. */
    isMine?: boolean
    /** É a mensagem mais recente da conversa. */
    isLatest?: boolean
    /** Esta cópia da linha é a que fica fixada abaixo do header. */
    isStickyCopy?: boolean
    /** Altura do header, para a cópia fixada não grudar atrás dele. */
    stickyTopInset?: number
    size?: MessageSizeProps
    translateX: SharedValue<number>
    isPlaying?: boolean
    progress?: number
    /**
     * Avatar montado pela tela.
     *
     * Chega como **função**, e não como elemento pronto: um elemento é criado a cada render
     * da lista, e prop nova a cada render anula o `React.memo` desta linha. Com a função —
     * que a tela memoiza uma vez — a identidade se mantém, e o elemento nasce aqui dentro, só
     * quando esta linha de fato renderiza.
     */
    renderAvatar?: (message: MessageReciveDataProps) => React.ReactNode
    /*
     * Os callbacks abaixo chegam **crus**, com a assinatura da lista (recebendo o id da
     * mensagem). Embrulhá-los por item na lista criava uma closure nova por linha a cada
     * render — o mesmo problema do avatar. Aqui o embrulho é memoizado por linha.
     */
    onAction?: (action: MessageActionType, messageId: string) => void
    onPressReply?: (replyToId: string) => void
    onPressReaction?: (messageId: string, emoji: string) => void
    onSeek?: (messageId: string, progress: number) => void
    onTogglePlay?: (messageId: string) => void
}

/**
 * Uma linha da conversa: mensagem, virada de dia ou aviso do sistema.
 *
 * No arrasto quem se desloca é a **mensagem** — bolha, avatar e reações juntos — com o
 * horário posicionado logo além da borda direita: ele já está lá, e o deslocamento apenas o
 * descobre.
 *
 * Virada de dia e aviso do sistema ficam parados. Eles pertencem à conversa, não a uma
 * mensagem, e não têm horário próprio a revelar; arrastá-los junto daria a impressão de que
 * também escondem algo à direita.
 *
 * **É aqui que a lista para de re-renderizar inteira.** Toda prop desta linha é estável entre
 * renders da conversa: o que varia por mensagem — avatar e callbacks com id — é construído
 * dentro, memoizado. Sem isso o `React.memo` do rodapé nunca acertava, e um tique de
 * progresso da nota de voz redesenhava as quarenta mensagens.
 */
function ChatListRow({
    row,
    sequence,
    isGroup,
    isMine,
    isLatest,
    isStickyCopy,
    stickyTopInset,
    size,
    translateX,
    isPlaying,
    progress,
    renderAvatar,
    onAction,
    onPressReply,
    onPressReaction,
    onSeek,
    onTogglePlay,
}: ChatListRowProps) {
    // Os hooks vêm antes do desvio do divisor: a ordem deles não pode depender do tipo da
    // linha, e `isDivider` é justamente um desvio.
    const message = isDivider(row) ? undefined : row
    const messageId = message?.id

    const avatar = React.useMemo(
        () => (message && renderAvatar ? renderAvatar(message) : undefined),
        [message, renderAvatar],
    )

    const handleAction = React.useMemo(
        () =>
            onAction && messageId
                ? (action: MessageActionType) => onAction(action, messageId)
                : undefined,
        [onAction, messageId],
    )

    const handlePressReaction = React.useMemo(
        () =>
            onPressReaction && messageId
                ? (emoji: string) => onPressReaction(messageId, emoji)
                : undefined,
        [onPressReaction, messageId],
    )

    const handleSeek = React.useMemo(
        () =>
            onSeek && messageId
                ? (nextProgress: number) => onSeek(messageId, nextProgress)
                : undefined,
        [onSeek, messageId],
    )

    const handleTogglePlay = React.useMemo(
        () => (onTogglePlay && messageId ? () => onTogglePlay(messageId) : undefined),
        [onTogglePlay, messageId],
    )

    /**
     * As `options` da mensagem, num objeto memoizado.
     *
     * Sem isto ele nasce novo a cada render e dispara o efeito do provider, que reescreve as
     * opções e provoca mais um render — um ciclo extra por mensagem, em toda a lista.
     */
    const options = React.useMemo(
        () => ({
            isMine,
            isGroup,
            isFirstOfGroup: sequence?.isFirstOfGroup ?? true,
            isLastOfGroup: sequence?.isLastOfGroup ?? true,
            followsAudio: sequence?.followsAudio ?? false,
            isLatest,
        }),
        [isGroup, isLatest, isMine, sequence],
    )

    // Deslocamento do arrasto, calculado na thread de UI. A linha inteira anda junto —
    // bolha, avatar e reações — com o horário já posicionado além da borda direita.
    const rowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }))

    if (isDivider(row)) {
        return row.kind === "date" ? (
            <DateSeparator
                date={row.label}
                floating={isStickyCopy}
                stickyTopInset={stickyTopInset}
            />
        ) : (
            <SystemMessage text={row.text} />
        )
    }

    return (
        <Animated.View style={rowStyle}>
            <MessageRender
                data={row}
                size={size}
                avatar={avatar}
                isPlaying={isPlaying}
                progress={progress}
                options={options}
                onAction={handleAction}
                onPressReply={onPressReply}
                onPressReaction={handlePressReaction}
                onSeek={handleSeek}
                onTogglePlay={handleTogglePlay}
            />
            <ChatListTimestamp date={row.createdAt} translateX={translateX} />
        </Animated.View>
    )
}

export default React.memo(ChatListRow)
