import React from "react"
import type { Channel, Event } from "stream-chat"

import { useChat } from "@/contexts/Chat"

/**
 * "Digitando…", nos dois sentidos.
 *
 * A leitura sai do `channel.state.typing`, que é a fonte da verdade enquanto a conversa está
 * aberta. O mesmo aviso também é empurrado para o `ChatContext`, e não por duplicação: o
 * grid mostra "digitando…" na célula de uma conversa que **não** está aberta, e ali não há
 * `channel.state` nenhum para ler. O contexto ainda resolve o `typing.stop` que se perde
 * quando a rede cai, expirando o aviso sozinho por TTL.
 */
export type Typing = {
    /** Alguém do outro lado está digitando agora. */
    peerTyping: boolean
    /** Chamar a cada tecla. O SDK já faz o throttle — não é preciso um aqui. */
    onChangeText: () => void
    /** Chamar ao enviar ou ao sair do campo. */
    onSubmitOrBlur: () => void
}

export function useTyping(channel: Channel | null, myUserId: string): Typing {
    const { startActivity, stopActivity, clearConversation } = useChat()
    const [peerTyping, setPeerTyping] = React.useState(false)

    React.useEffect(() => {
        if (!channel) return

        const cid = channel.cid

        const sync = () => {
            const others = Object.keys(channel.state.typing).filter(
                (userId) => String(userId) !== myUserId,
            )
            setPeerTyping(others.length > 0)
        }

        const subscription = channel.on((event: Event) => {
            if (event.type !== "typing.start" && event.type !== "typing.stop") return

            const userId = event.user?.id
            if (userId !== undefined && String(userId) !== myUserId) {
                if (event.type === "typing.start") startActivity(cid, String(userId), "typing")
                else stopActivity(cid, String(userId))
            }

            sync()
        })

        sync()

        return () => {
            subscription.unsubscribe()
            // A tela sai, o aviso morre com ela: quem ficou digitando quando a conversa
            // fechou continuaria "digitando" para sempre na célula do grid.
            clearConversation(cid)
        }
    }, [channel, myUserId, startActivity, stopActivity, clearConversation])

    const onChangeText = React.useCallback(() => {
        channel?.keystroke().catch(() => {})
    }, [channel])

    const onSubmitOrBlur = React.useCallback(() => {
        channel?.stopTyping().catch(() => {})
    }, [channel])

    return { peerTyping, onChangeText, onSubmitOrBlur }
}
