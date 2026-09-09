import { type MessageStory, messageMeta } from "./message.meta"
import { baseMessage, me } from "./message.mock"

/**
 * Menções.
 *
 * Os índices são sobre a string crua (`start`/`end`), não um marcador dentro do
 * texto: é assim que o `Message.Text` recorta, sem passar regex por cima do que
 * o usuário escreveu. Por isso os valores aqui são as posições reais das frases.
 */
const meta = {
    ...messageMeta,
    title: "Chat/Message/Menções",
}

export default meta

type Story = MessageStory

export const Single: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "6",
            content: "Eu passo na confeitaria. @Marina você leva os refrigerantes?",
            mentions: [{ start: 25, end: 32, userId: "2", username: "marina" }],
        },
    },
}

/**
 * Duas menções na mesma frase, uma delas no índice 0.
 *
 * É o caso que quebra implementação ingênua: quem assume que sempre há texto
 * antes da primeira menção perde o começo da mensagem.
 */
export const Multiple: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "7",
            content: "@Rafael Ribeiro e @Marina, alguém pode buscar o bolo às 16h?",
            mentions: [
                { start: 0, end: 15, userId: "3", username: "rafael" },
                { start: 18, end: 25, userId: "2", username: "marina" },
            ],
        },
        isGroup: true,
    },
}

/** Na bolha enviada o destaque troca de cor para não sumir no fundo. */
export const OnSentBubble: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "8",
            author: me,
            content: "Eu passo na confeitaria. @Marina você leva os refrigerantes?",
            mentions: [{ start: 25, end: 32, userId: "2", username: "marina" }],
        },
    },
}
