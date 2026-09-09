import React from "react"
import { Pressable } from "react-native"

import actions_menu from "./components/message.actions.menu"
import audio from "./components/media/audio"
import author_name from "./components/message.author.name"
import bubble from "./components/message.bubble"
import container from "./components/message.container"
import content from "./components/message.content"
import edited_label from "./components/message.edited.label"
import footer from "./components/message.footer"
import forwarded_label from "./components/message.forwarded.label"
import message_status from "./components/message.status"
import message_text from "./components/message.text"
import message_time from "./components/message.time"
import reactions from "./components/message.reactions"
import reply_preview from "./components/message.reply.preview"
import root from "./components/message.root"
import { MessageRenderProps } from "./message.types"

/**
 * Renderizador único da mensagem.
 *
 * A árvore é a mesma para todo formato, e **não há condicional aqui**: cada
 * bloco decide sozinho se aparece, lendo o `messageType` e o `data` do contexto
 * (o provider deriva o tipo de `deletedAt`/`contentType`, salvo se quem
 * renderiza impuser outro).
 *
 * Ou seja: o player só se desenha quando o tipo é `audio`; o texto vira lápide
 * quando é `deleted`; citação, "encaminhada" e "editada" somem sozinhos numa
 * mensagem apagada. Concentrar isso em cada componente evita que a regra de "o
 * que aparece quando" fique espalhada por toda árvore que renderize mensagem —
 * inclusive as que ainda não existem.
 *
 * Os blocos seguem expostos no `Message` abaixo: quem precisar de uma composição
 * fora do comum monta a sua, este é o caminho curto.
 */
export function MessageRender({
    data,
    messageType,
    options,
    size,
    avatar,
    progress,
    isPlaying,
    onAction,
    onPressReaction,
    onPressReply,
    onSeek,
}: MessageRenderProps) {
    return (
        <Message.Root data={data} options={{ ...options, messageType }} size={size}>
            <Message.Container avatar={avatar}>
                <Message.ActionsMenu onAction={(action) => onAction?.(action, data.id)}>
                    <Message.Bubble>
                        <Message.AuthorName />
                        <Message.Content>
                            <Message.ForwardedLabel />
                            <Pressable
                                onPress={
                                    data.replyTo
                                        ? () => onPressReply?.(data.replyTo!.id)
                                        : undefined
                                }
                            >
                                <Message.ReplyPreview />
                            </Pressable>
                            <Message.Media.Audio
                                progress={progress}
                                isPlaying={isPlaying}
                                onSeek={onSeek}
                            />
                            <Message.Text />
                        </Message.Content>
                        <Message.Footer>
                            <Message.EditedLabel />
                            <Message.Time />
                            <Message.Status />
                        </Message.Footer>
                    </Message.Bubble>
                </Message.ActionsMenu>
                <Message.Reactions onPressReaction={onPressReaction} />
            </Message.Container>
        </Message.Root>
    )
}

export const Message = {
    /** Renderizador pronto: a árvore completa, para a lista do chat. */
    Render: MessageRender,
    Root: root,
    Container: container,
    Bubble: bubble,
    Content: content,
    Footer: footer,
    AuthorName: author_name,
    ReplyPreview: reply_preview,
    Text: message_text,
    Media: {
        Audio: audio,
    },
    ForwardedLabel: forwarded_label,
    EditedLabel: edited_label,
    Time: message_time,
    Status: message_status,
    Reactions: reactions,
    ActionsMenu: actions_menu,
}

export * from "./message.types"
export { resolveMessageType } from "./helpers/resolveMessageType"

export default Message
