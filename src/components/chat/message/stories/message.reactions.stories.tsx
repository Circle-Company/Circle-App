import { type MessageStory, messageMeta } from "./message.meta"
import { baseMessage, me } from "./message.mock"

const meta = {
    ...messageMeta,
    title: "Chat/Message/Reações",
}

export default meta

type Story = MessageStory

export const Single: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "15",
            reactions: [{ emoji: "❤️", count: 1, reactedByMe: true }],
        },
    },
}

/** Contagem só aparece a partir de duas — uma pílula com "1" é ruído. */
export const Multiple: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "16",
            reactions: [
                { emoji: "❤️", count: 1, reactedByMe: true },
                { emoji: "😂", count: 3, reactedByMe: false },
                { emoji: "👍", count: 12, reactedByMe: false },
            ],
        },
    },
}

/** Contagem só aparece a partir de duas — uma pílula com "1" é ruído. */
export const MultipleWithSequence: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "16",
            reactions: [
                { emoji: "❤️", count: 1, reactedByMe: true },
                { emoji: "😂", count: 3, reactedByMe: false },
                { emoji: "👍", count: 12, reactedByMe: false },
            ],
        },
        isGroup: false,
        isFirstOfGroup: true,
        isLastOfGroup: false,
    },
}

/** Na bolha enviada as pílulas ancoram à direita. */
export const OnSentBubble: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "17",
            author: me,
            content: "Levo o projetor na quinta.",
            reactions: [{ emoji: "🙏", count: 2, reactedByMe: false }],
        },
    },
}
