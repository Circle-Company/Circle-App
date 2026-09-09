import type { Meta, StoryObj } from "@storybook/react-native"

import { SystemMessage } from ".."

/**
 * Aviso do sistema no meio da lista.
 *
 * Não é bolha nem tem autor — por isso não usa o contexto da mensagem e recebe
 * o texto já resolvido.
 */
const meta = {
    title: "Chat/SystemMessage",
    component: SystemMessage,
} satisfies Meta<typeof SystemMessage>

export default meta

type Story = StoryObj<typeof meta>

export const MemberJoined: Story = {
    args: { text: "Rafael entrou no grupo" },
}

export const MemberLeft: Story = {
    args: { text: "Luana saiu do grupo" },
}

export const GroupRenamed: Story = {
    args: { text: 'O grupo agora se chama "Família Ribeiro"' },
}

/** Aviso longo: o texto quebra em várias linhas dentro da mesma etiqueta. */
export const LongNotice: Story = {
    args: {
        text: "As mensagens desta conversa são protegidas com criptografia de ponta a ponta. Ninguém fora dela pode lê-las.",
    },
}
