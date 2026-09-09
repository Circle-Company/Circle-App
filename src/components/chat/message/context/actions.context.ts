import React from "react"

import PersistedContext from "@/contexts/Persisted"
import {
    MessageActionPayload,
    MessageActionType,
    MessageDeliveryStatus,
    MessageReactionProps,
} from "../message.types"

export interface MessageActionsState {
    reactions: MessageReactionProps[]
    status: MessageDeliveryStatus
    setReactions: React.Dispatch<React.SetStateAction<MessageReactionProps[]>>
    setStatus: React.Dispatch<React.SetStateAction<MessageDeliveryStatus>>
    /**
     * Resolve com `true` quando a ação foi aceita e com `false` quando foi
     * negada (sem permissão, payload inválido) ou falhou. Não rejeita: os
     * componentes disparam sem `await` nem `catch`, como no moment.
     */
    registerAction: <T extends MessageActionType>(
        actionType: T,
        data: MessageActionPayload<T>,
    ) => Promise<boolean>
}

/**
 * @param messageId Id da mensagem sobre a qual as ações são registradas.
 * @param authorId  Id do **autor** da mensagem. É o que permite negar edição e
 *                  exclusão de mensagem alheia — mesma guarda de posse do
 *                  `EXCLUDE` no moment.
 */
export function useActions(messageId?: string, authorId?: string): MessageActionsState {
    const { session } = React.useContext(PersistedContext)

    const [reactions, setReactions] = React.useState<MessageReactionProps[]>([])
    const [status, setStatus] = React.useState<MessageDeliveryStatus>("sent")

    const registerAction = React.useCallback(
        async <T extends MessageActionType>(actionType: T, data: MessageActionPayload<T>) => {
            if (!messageId || !session.account.userId) {
                console.warn("MessageId ou sessão indisponível para registrar a ação")
                return false
            }

            // `String()` dos dois lados porque o id pode chegar como número do backend.
            const isAuthor = !!authorId && String(authorId) === String(session.account.userId)

            switch (actionType) {
                case "EDIT":
                case "DELETE": {
                    if (!isAuthor) {
                        console.warn(
                            `${actionType} negado: a mensagem não pertence ao usuário logado`,
                            JSON.stringify({ messageId, hasAuthorId: !!authorId }),
                        )
                        return false
                    }
                    break
                }
                case "REACT":
                case "UNREACT": {
                    const payload = data as { emoji?: string }
                    if (!payload?.emoji) {
                        console.warn("REACT/UNREACT requer payload { emoji: string }")
                        return false
                    }
                    break
                }
                default:
                    break
            }

            // TODO: ligar em `apiRoutes.chat.*` quando as rotas de chat existirem.
            // Até lá a camada só valida e devolve o resultado para o chamador,
            // que aplica a mutação otimista.
            //
            // Não há `try/catch` aqui de propósito: sem chamada de rede nada pode
            // lançar, e o `catch` que existia antes era código inalcançável — dava
            // a impressão de haver tratamento de erro onde não havia. Ele volta
            // junto com a chamada real.
            return true
        },
        [messageId, authorId, session.account.userId],
    )

    return {
        reactions,
        status,
        setReactions,
        setStatus,
        registerAction,
    }
}
