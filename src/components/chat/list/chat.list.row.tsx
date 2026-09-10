import React from "react"
import { Animated } from "react-native"

import ChatListTimestamp from "./chat.list.timestamp"
import { DateSeparator } from "../date.separator"
import { MessageRender } from "../message"
import { SystemMessage } from "../system.message"
import { ChatRow, ChatSequence, isDivider } from "./chat.list.types"
import { MessageActionType, MessageSizeProps } from "../message/message.types"

export type ChatListRowProps = {
    row: ChatRow
    sequence?: ChatSequence
    isGroup: boolean
    /** É a mensagem mais recente da conversa. */
    isLatest?: boolean
    size?: MessageSizeProps
    translateX: Animated.Value
    avatar?: React.ReactNode
    isPlaying?: boolean
    progress?: number
    onAction?: (action: MessageActionType, messageId: string) => void
    onPressReply?: (replyToId: string) => void
    onPressReaction?: (emoji: string) => void
    onSeek?: (progress: number) => void
    onTogglePlay?: () => void
}

/**
 * Uma linha da conversa: mensagem, virada de dia ou aviso do sistema.
 *
 * No arrasto quem se desloca é a **mensagem** — bolha, avatar e reações juntos —
 * com o horário posicionado logo além da borda direita: ele já está lá, e o
 * deslocamento apenas o descobre.
 *
 * Virada de dia e aviso do sistema ficam parados. Eles pertencem à conversa, não
 * a uma mensagem, e não têm horário próprio a revelar; arrastá-los junto daria a
 * impressão de que também escondem algo à direita.
 */
function ChatListRow({
    row,
    sequence,
    isGroup,
    isLatest,
    size,
    translateX,
    avatar,
    isPlaying,
    progress,
    onAction,
    onPressReply,
    onPressReaction,
    onSeek,
    onTogglePlay,
}: ChatListRowProps) {
    if (isDivider(row)) {
        return row.kind === "date" ? (
            <DateSeparator date={row.label} />
        ) : (
            <SystemMessage text={row.text} />
        )
    }

    return (
        <Animated.View style={{ transform: [{ translateX }] }}>
            <MessageRender
                data={row}
                size={size}
                avatar={avatar}
                isPlaying={isPlaying}
                progress={progress}
                options={{
                    isGroup,
                    isFirstOfGroup: sequence?.isFirstOfGroup ?? true,
                    isLastOfGroup: sequence?.isLastOfGroup ?? true,
                    isLatest,
                }}
                onAction={onAction}
                onPressReply={onPressReply}
                onPressReaction={onPressReaction}
                onSeek={onSeek}
                onTogglePlay={onTogglePlay ? () => onTogglePlay() : undefined}
            />
            <ChatListTimestamp date={row.createdAt} translateX={translateX} />
        </Animated.View>
    )
}

export default React.memo(ChatListRow)
