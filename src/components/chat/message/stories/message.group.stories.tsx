import { type MessageStory, groupControls, messageMeta } from "./message.meta"
import { baseMessage, marina, rafael } from "./message.mock"

/**
 * Conversa em grupo: nome do autor no topo da bolha e espaço do avatar à
 * esquerda. `isFirstOfGroup` / `isLastOfGroup` controlam quando cada um aparece
 * numa sequência do mesmo autor.
 */
const meta = {
    ...messageMeta,
    title: "Chat/Message/Grupo",
    // Alternar a posição na sequência é o ponto desta seção.
    argTypes: { ...messageMeta.argTypes, ...groupControls },
}

export default meta

type Story = MessageStory

export const FirstOfSequence: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "12",
            author: rafael,
            content: "Bom dia! Alguém pode buscar o bolo às 16h?",
        },
        isGroup: true,
        isFirstOfGroup: true,
        isLastOfGroup: false,
    },
}

/** No meio da sequência o nome some, e o espaço do avatar fica reservado. */
export const MiddleOfSequence: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "13",
            author: rafael,
            content: "Combinado, aviso a sala na quinta de manhã.",
        },
        isGroup: true,
        isFirstOfGroup: false,
        isLastOfGroup: false,
    },
}

/** Só na última da sequência o avatar é renderizado. */
export const LastOfSequence: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "14",
            author: marina,
            content: "Eu passo na confeitaria.",
        },
        isGroup: true,
        isFirstOfGroup: true,
        isLastOfGroup: true,
    },
}
