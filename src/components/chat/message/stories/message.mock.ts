import { MessageReciveDataProps } from "../message.types"

/**
 * Dados compartilhados pelas stories da mensagem.
 *
 * Ficam num arquivo só para os arquivos de story não divergirem sobre quem é
 * quem — o autor e o horário aparecem em quase todos os casos, e três versões
 * ligeiramente diferentes da "Marina" tornariam impossível comparar duas stories
 * lado a lado.
 */

/** O mesmo id que o decorator do Storybook usa como usuário logado. */
export const ME_ID = "1"

export const marina: MessageReciveDataProps["author"] = {
    id: "2",
    username: "marina",
    name: "Marina Albuquerque",
    profilePicture: null,
    color: "#7C3AED",
}

export const rafael: MessageReciveDataProps["author"] = {
    id: "3",
    username: "rafael",
    name: "Rafael Ribeiro",
    profilePicture: null,
    color: "#E8590C",
}

export const me: MessageReciveDataProps["author"] = {
    id: ME_ID,
    username: "voce",
    name: "Você",
    profilePicture: null,
}

/** Mensagem recebida, de texto — a base de onde as demais derivam. */
export const baseMessage: MessageReciveDataProps = {
    id: "1",
    chatId: "chat-1",
    author: marina,
    contentType: "text",
    content: "Oi! Consegui dois ingressos pro show de sexta.",
    status: "read",
    createdAt: new Date("2026-09-09T14:02:00").toISOString(),
}

/**
 * Waveform de exemplo.
 *
 * Gerada pelo próprio `calculeWaveformBars` sobre um sinal de fala sintético:
 * são os valores que o algoritmo produz de verdade, não números escolhidos a
 * olho — uma story com desenho inventado mentiria sobre o resultado do código.
 */
export const sampleWaveform = [
    0.89, 0.98, 1, 0.94, 0.8, 0.62, 0.64, 0.64, 0.53, 0.24, 0.89, 0.94, 0.89, 0.76, 0.68, 0.78,
    0.81, 0.74, 0.57, 0.3, 0.38, 0.81, 0.7, 0.73, 0.87, 0.92, 0.89, 0.76,
]
