import React from "react"
import { View } from "react-native"
import { FlashList } from "@shopify/flash-list"

import ChatListRow from "./chat.list.row"
import { ChatListProps, ChatRow, isDivider } from "./chat.list.types"
import { MessageActionType } from "../message/message.types"
import { resolveSequence } from "./helpers/chat.list.sequence"
import { useRevealGesture } from "./chat.list.reveal"

/**
 * Lista da conversa.
 *
 * Junta o que os componentes de chat não sabem sozinhos: a ordem das linhas, a
 * posição de cada mensagem na sequência do mesmo autor, e o gesto de arrastar
 * para a esquerda que revela o horário de cada uma.
 *
 * O deslocamento do arrasto é uma `Animated.Value` só, compartilhada por todas
 * as linhas: a lista anda inteira, então uma por linha seria o mesmo movimento
 * calculado N vezes por quadro.
 */
export default function ChatList({
    rows,
    isGroup = false,
    size,
    contentInsetTop = 0,
    renderAvatar,
    onAction,
    onPressReply,
    onPressReaction,
    onSeek,
    playingMessageId,
    playingProgress = 0,
}: ChatListProps) {
    const { translateX, panHandlers } = useRevealGesture()

    const sequence = React.useMemo(() => resolveSequence(rows), [rows])

    const keyExtractor = React.useCallback((row: ChatRow) => row.id, [])

    const renderItem = React.useCallback(
        ({ item }: { item: ChatRow }) => (
            <ChatListRow
                row={item}
                sequence={isDivider(item) ? undefined : sequence.get(item.id)}
                isGroup={isGroup}
                size={size}
                translateX={translateX}
                avatar={isDivider(item) ? undefined : renderAvatar?.(item)}
                isPlaying={!isDivider(item) && item.id === playingMessageId}
                progress={!isDivider(item) && item.id === playingMessageId ? playingProgress : 0}
                onAction={
                    onAction
                        ? (action: MessageActionType, messageId: string) =>
                              onAction(action, messageId)
                        : undefined
                }
                onPressReply={onPressReply}
                onPressReaction={
                    onPressReaction && !isDivider(item)
                        ? (emoji: string) => onPressReaction(item.id, emoji)
                        : undefined
                }
                onSeek={
                    onSeek && !isDivider(item)
                        ? (progress: number) => onSeek(item.id, progress)
                        : undefined
                }
            />
        ),
        [
            isGroup,
            onAction,
            onPressReaction,
            onPressReply,
            onSeek,
            playingMessageId,
            playingProgress,
            renderAvatar,
            sequence,
            size,
            translateX,
        ],
    )

    return (
        // O gesto fica no envelope, e não na lista: assim ele observa o
        // movimento sem disputar o `onScroll` dela, e só assume quando o arrasto
        // é horizontal (ver `useRevealGesture`).
        <View style={{ flex: 1, overflow: "hidden" }} {...panHandlers}>
            <FlashList
                data={rows}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={{ paddingTop: contentInsetTop + 8, paddingBottom: 8 }}
                // Conversa antiga fica acima; o fim da lista é o presente.
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

export { REVEAL_WIDTH } from "./chat.list.reveal"
export * from "./chat.list.types"
export { resolveSequence } from "./helpers/chat.list.sequence"
