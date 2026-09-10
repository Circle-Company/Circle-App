import React from "react"
import type { Event } from "stream-chat"

import { useChat } from "@/contexts/Chat"

/**
 * Total de mensagens não lidas, para o badge da aba.
 *
 * **Não vem do inbox de notificações.** Mensagem é push-only: não gera linha em
 * `/notifications` e não entra no contador de lá. O número certo é o do Stream, que já conta
 * por conversa e desconta assim que `markRead()` roda.
 *
 * O valor inicial sai de `client.user`, preenchido na conexão; daí em diante, quase todo
 * evento do WebSocket carrega o total atualizado — por isso a leitura é do evento, e não uma
 * soma nossa por canal.
 */
export function useChatUnread(): number {
    const { client } = useChat()
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
        if (!client) {
            setCount(0)
            return
        }

        /*
         * O cast existe porque `client.user` é tipado como `UserResponse | OwnUserResponse`, e
         * só a segunda declara os contadores. Quem está conectado é sempre o próprio usuário —
         * a união é do tipo, não do runtime.
         */
        const me = client.user as { total_unread_count?: number } | undefined
        setCount(Number(me?.total_unread_count ?? 0))

        const subscription = client.on((event: Event) => {
            if (typeof event.total_unread_count === "number") setCount(event.total_unread_count)
        })

        return () => subscription.unsubscribe()
    }, [client])

    return count
}
