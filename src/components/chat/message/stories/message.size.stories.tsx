import { type MessageStory, messageMeta, sizeControls } from "./message.meta"
import { baseMessage, marina, me } from "./message.mock"

/**
 * Bancada de tamanhos.
 *
 * O ajuste fino (padding, raio, largura máxima, ...) vive só aqui, e não em toda
 * story: no resto das seções esses sliders só atrapalhariam quem quer olhar um
 * estado da mensagem. Quem está calibrando a bolha vem para cá.
 */
const meta = {
    ...messageMeta,
    title: "Chat/Message/Tamanhos",
    argTypes: { ...messageMeta.argTypes, ...sizeControls },
}

export default meta

type Story = MessageStory

export const Compact: Story = {
    args: { sizePreset: "compact", data: baseMessage },
}

export const Standart: Story = {
    args: { sizePreset: "standart", data: baseMessage },
}

export const Large: Story = {
    args: { sizePreset: "large", data: baseMessage },
}

/**
 * Texto longo com preset e sobrescritas em jogo — é onde `maxWidthRatio` e
 * `padding` mostram efeito de verdade.
 */
export const LongText: Story = {
    args: {
        data: {
            ...baseMessage,
            id: "18",
            author: me,
            content:
                "Consegui dois ingressos pro show de sexta, mas o estacionamento do teatro fecha às 23h — se a gente sair depois disso, vai ter que deixar o carro na rua de trás.",
        },
    },
}

/** Em grupo o `avatarSize` também entra na conta da largura disponível. */
export const InGroup: Story = {
    args: {
        data: { ...baseMessage, id: "19", author: marina },
        isGroup: true,
        isLastOfGroup: true,
    },
}
