import React from "react"

import { MessageReciveDataProps, MessageSizeProps } from "../message/message.types"

/**
 * Marcadores que a lista intercala entre as mensagens.
 *
 * Ficam como linhas da mesma lista, e não como decoração de uma mensagem: quem
 * decide onde o dia vira, ou onde entra um aviso do sistema, é a conversa.
 */
export type ChatDivider =
    { kind: "date"; id: string; label: string } | { kind: "system"; id: string; text: string }

export type ChatRow = MessageReciveDataProps | ChatDivider

export const isDivider = (row: ChatRow): row is ChatDivider => "kind" in row

/** Posição da mensagem na sequência do mesmo autor, resolvida pela lista. */
export type ChatSequence = {
    isFirstOfGroup: boolean
    isLastOfGroup: boolean
    /**
     * A mensagem logo acima é uma nota de voz do mesmo autor.
     *
     * A linha do áudio é mais alta e sempre desenha o avatar (ver `avatarSlot`), então a
     * mensagem seguinte encosta nela com o respiro normal de dentro do bloco. Quem sabe
     * disso é a lista, que enxerga os vizinhos — a mensagem sozinha não tem como saber.
     */
    followsAudio: boolean
}

export type ChatListProps = {
    rows: ChatRow[]
    /**
     * Id de quem está lendo a conversa.
     *
     * Quando informado, é ele que decide de que lado cada bolha fica — e não a sessão do app.
     * A identidade que importa numa conversa é a do serviço de chat, que nem sempre é a
     * mesma da sessão; sem isso, uma sessão vazia joga a conversa inteira para o lado de
     * quem recebe, sem nenhuma mensagem enviada.
     */
    myUserId?: string
    /** Conversa em grupo: habilita nome do autor e avatar. */
    isGroup?: boolean
    size?: MessageSizeProps
    /**
     * Altura a reservar no topo da rolagem — na prática, a do header.
     *
     * A conversa costuma viver sob um header transparente, e sem esta folga a primeira
     * mensagem nasce atrás dele. Chega de fora porque quem conhece a altura do header é a
     * tela (`useHeaderHeight`), não o chat.
     */
    contentInsetTop?: number
    /**
     * Como o iOS ajusta o inset do conteúdo por conta própria.
     *
     * Fica como prop, e não fixo aqui, porque depende do header **da tela**: sob um header
     * transparente o ajuste automático soma com o `contentInsetTop` e o conteúdo desce duas
     * vezes. Quem sabe disso é quem configurou o header, não o chat.
     */
    contentInsetAdjustmentBehavior?: "automatic" | "scrollableAxes" | "never" | "always"
    /**
     * Desliga a ancoragem de posição da lista. **Praticamente ninguém deve usar.**
     *
     * A ancoragem vem ligada por padrão na FlashList v2 e é o que segura o conteúdo visível no
     * lugar quando a altura do que está **acima** muda — que é o tempo todo ao subir numa
     * conversa, porque a lista vai medindo linhas que só conhecia por estimativa.
     *
     * Esta tela já a desligou uma vez, para tratar um sintoma: as linhas mudavam de altura
     * depois de montadas (o menu de ações media a bolha dentro do próprio host, e realimentava
     * a medida), a ancoragem corrigia a cada volta e a conversa escorregava sem parar. A causa
     * era o laço de medida, não a ancoragem — e desligá-la trocou o escorregamento por algo
     * pior: sem correção de offset, subir o scroll embaralha as bolhas.
     *
     * Continua sendo prop porque é decisão da tela, mas se a vontade de ligá-la aparecer, o
     * que está errado é quase certamente uma altura que muda depois de medida.
     */
    disableContentAnchoring?: boolean
    /**
     * O que fica **depois** da última mensagem, dentro da rolagem.
     *
     * É onde entra a bolha de "digitando": ela ocupa o lugar da mensagem que está para
     * chegar, então precisa correr junto com o conteúdo — presa fora da lista, ela ficaria
     * colada no rodapé da tela mesmo com a conversa rolada para o meio, dizendo que alguém
     * digita num ponto da conversa que não é aquele.
     */
    footer?: React.ReactElement | null
    /** Avatar do autor, montado pela tela — o chat não conhece o componente. */
    renderAvatar?: (message: MessageReciveDataProps) => React.ReactNode
    onAction?: (action: string, messageId: string) => void
    onPressReply?: (replyToId: string) => void
    onPressReaction?: (messageId: string, emoji: string) => void
    onSeek?: (messageId: string, progress: number) => void
    /** Play/pause de uma nota de voz. */
    onTogglePlay?: (messageId: string) => void
    /** Id da nota de voz tocando agora, se houver. */
    playingMessageId?: string
    /** Progresso da nota de voz em reprodução (0..1). */
    playingProgress?: number
}
