import type { MessageSizeProps } from "../message/message.types"

export type TypingIndicatorProps = {
    /**
     * Preset de tamanho, o mesmo das bolhas.
     *
     * A bolha de digitando é uma bolha como as outras: se a conversa usa `compact`, esta
     * precisa acompanhar, senão ela aparece maior que as mensagens que a cercam.
     */
    size?: MessageSizeProps
    /**
     * Do lado de quem envia.
     *
     * Existe porque o mesmo componente serve para mostrar que **eu** estou gravando ou
     * digitando num outro dispositivo. Na conversa comum é sempre o lado de quem recebe.
     */
    isMine?: boolean
    /** Nome de quem está digitando — só é usado em grupo, acima dos pontos. */
    authorName?: string | null
    /** Avatar montado por quem usa, como no resto do chat. */
    avatar?: React.ReactNode
}
