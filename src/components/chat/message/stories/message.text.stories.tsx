import { type MessageStory, messageMeta } from "./message.meta"
import { baseMessage, marina, me } from "./message.mock"

const meta = {
    ...messageMeta,
    title: "Chat/Message/Texto",
}

export default meta

type Story = MessageStory

export const Received: Story = {
    args: { data: baseMessage },
}

/**
 * O lado da bolha vem de `isMine`, que o provider deriva comparando o autor com
 * a sessão — não é uma prop. Por isso a story troca o autor pelo usuário logado,
 * em vez de um "sent: true" que não existe.
 */
export const Sent: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "2",
            author: me,
            content: "Que ótimo! Que horas abre a casa?",
            editedAt: new Date("2026-09-09T14:05:00").toISOString(),
        },
    },
}

export const WithReply: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "3",
            content: "Perfeito, chego junto com você.",
            replyTo: {
                id: "1",
                author: marina,
                preview: "Consegui dois ingressos pro show de sexta.",
                contentType: "text",
            },
        },
    },
}

export const Forwarded: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "4",
            author: me,
            content: "O estacionamento do teatro fecha às 23h.",
            forwarded: true,
        },
    },
}

/** Mensagem apagada: lápide, sem ações e sem nada do conteúdo original. */
export const Deleted: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "5",
            content: null,
            deletedAt: new Date("2026-09-09T14:10:00").toISOString(),
        },
    },
}
