import React from "react"
import { View } from "react-native"
import type { Meta, StoryObj } from "@storybook/react-native"

import ChatList, { type ChatRow } from "../list"
import { marina, me, rafael, sampleWaveform } from "../message/stories/message.mock"
import { messageSizes } from "../message/message.sizes"

/**
 * Conversa inteira, em vez de uma bolha isolada.
 *
 * Vive fora da pasta `message` porque não é uma story da mensagem: ela junta
 * mensagem, separador de data e aviso de sistema, e o que se avalia aqui é a
 * lista — o ritmo entre bolhas de lados diferentes, o encadeamento de uma
 * sequência do mesmo autor, e como cantos, rodapé e avatar reagem a isso.
 */
type ConversationArgs = { sizePreset: keyof typeof messageSizes }

const meta = {
    title: "Chat/Conversa",
    // Sem `component`: a story monta uma lista, e não um componente com props —
    // apontar o `MessageRender` aqui faria o painel oferecer controles de uma
    // mensagem só, que não é o que se ajusta nesta seção.
    argTypes: {
        sizePreset: {
            control: "inline-radio",
            options: Object.keys(messageSizes),
            table: { category: "Tamanho" },
        },
    },
    args: { sizePreset: "standart" },
} satisfies Meta<ConversationArgs>

export default meta

type Story = StoryObj<ConversationArgs>

/** Horário fixo: story com `new Date()` mudaria de aparência a cada abertura. */
const at = (time: string) => new Date(`2026-09-09T${time}:00`).toISOString()

const renderConversation = (rows: ChatRow[], isGroup = false) =>
    function ConversationStory(args: ConversationArgs) {
        return (
            <ChatList
                rows={rows}
                isGroup={isGroup}
                size={messageSizes[args.sizePreset] ?? messageSizes.standart}
                renderAvatar={(message) => (
                    <View
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            backgroundColor: message.author.color ?? "#999",
                        }}
                    />
                )}
            />
        )
    }

/**
 * Conversa 1:1 — o caso mais comum.
 *
 * Traz de propósito uma sequência de três mensagens seguidas da Marina: é ali
 * que se vê o canto arredondado só fechar na última do bloco.
 */
export const OneToOne: Story = {
    render: renderConversation([
        { kind: "date", id: "d1", label: "Hoje" },
        {
            id: "c1",
            chatId: "chat-1",
            author: marina,
            contentType: "text",
            content: "Oi! Consegui dois ingressos pro show de sexta.",
            status: "read",
            createdAt: at("14:02"),
            // Respondida logo abaixo (c2), então mostra a contagem no rodapé.
            replyCount: 1,
        },
        {
            id: "c2",
            chatId: "chat-1",
            author: me,
            contentType: "text",
            content: "Que ótimo! Que horas abre a casa?",
            status: "read",
            createdAt: at("14:05"),
            editedAt: at("14:06"),
            replyTo: {
                id: "c1",
                author: marina,
                preview: "Consegui dois ingressos pro show de sexta.",
                contentType: "text",
            },
        },
        {
            id: "c3",
            chatId: "chat-1",
            author: marina,
            contentType: "text",
            content: "Abre às 20h, mas o show começa 22h.",
            status: "read",
            createdAt: at("14:07"),
        },
        {
            id: "c4",
            chatId: "chat-1",
            author: marina,
            contentType: "text",
            content: "Já deixei o comprovante salvo, guarda aí.",
            status: "read",
            createdAt: at("14:07"),
            reactions: [{ emoji: "❤️", count: 1, reactedByMe: true }],
        },
        {
            id: "c5",
            chatId: "chat-1",
            author: marina,
            contentType: "text",
            content: "E o estacionamento fecha às 23h.",
            status: "read",
            createdAt: at("14:08"),
        },
        {
            id: "c6",
            chatId: "chat-1",
            author: me,
            contentType: "audio",
            content: null,
            status: "read",
            createdAt: at("14:09"),
            media: {
                url: "file:///mock/voice-note.wav",
                duration: 14,
                waveform: sampleWaveform,
            },
        },
        {
            id: "c7",
            chatId: "chat-1",
            author: marina,
            contentType: "text",
            content: "Perfeito, combinado então.",
            status: "read",
            createdAt: at("14:12"),
        },
        {
            id: "c8",
            chatId: "chat-1",
            author: me,
            contentType: "text",
            content: "O estacionamento do teatro fecha às 23h.",
            status: "delivered",
            createdAt: at("14:14"),
            forwarded: true,
        },
        {
            id: "c9",
            chatId: "chat-1",
            author: me,
            contentType: "text",
            content: null,
            status: "sent",
            createdAt: at("14:15"),
            deletedAt: at("14:16"),
        },
        {
            id: "c10",
            chatId: "chat-1",
            author: me,
            contentType: "text",
            content: "Te encontro lá às 19h40.",
            status: "pending",
            createdAt: at("14:18"),
        },
    ]),
}

/**
 * Conversa em grupo.
 *
 * Aqui aparecem o nome do autor no topo da bolha, o avatar só na última do
 * bloco e o espaço reservado nas demais — além do aviso de sistema no meio da
 * lista.
 */
export const Group: Story = {
    render: renderConversation(
        [
            { kind: "date", id: "d1", label: "Hoje" },
            { kind: "system", id: "s1", text: "Rafael entrou no grupo" },
            {
                id: "g1",
                chatId: "chat-2",
                author: rafael,
                contentType: "text",
                content: "Bom dia! Alguém pode buscar o bolo às 16h?",
                status: "read",
                createdAt: at("08:12"),
            },
            {
                id: "g2",
                chatId: "chat-2",
                author: marina,
                contentType: "text",
                content: "Eu passo na confeitaria. @Rafael você leva os refrigerantes?",
                status: "read",
                createdAt: at("08:20"),
                replyCount: 3,
                mentions: [{ start: 25, end: 32, userId: rafael.id, username: "rafael" }],
            },
            {
                id: "g3",
                chatId: "chat-2",
                author: rafael,
                contentType: "text",
                content: "Levo sim, chego junto com você.",
                status: "read",
                createdAt: at("08:31"),
                replyTo: {
                    id: "g2",
                    author: marina,
                    preview: "Eu passo na confeitaria.",
                    contentType: "text",
                },
            },
            {
                id: "g4",
                chatId: "chat-2",
                author: me,
                contentType: "text",
                content: "Levo o projetor na quinta.",
                status: "read",
                createdAt: at("08:34"),
                editedAt: at("08:35"),
            },
            {
                id: "g5",
                chatId: "chat-2",
                author: rafael,
                contentType: "text",
                content: "Combinado, aviso a sala na quinta de manhã.",
                status: "read",
                createdAt: at("08:41"),
                reactions: [
                    { emoji: "👍", count: 2, reactedByMe: true },
                    { emoji: "🙏", count: 1, reactedByMe: false },
                ],
            },
        ],
        true,
    ),
}
