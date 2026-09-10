import React from "react"

import PersistedContext from "@/contexts/Persisted"
import {
    MessageActionPayload,
    MessageActionType,
    MessageDeliveryStatus,
    MessageReactionProps,
} from "../message.types"
import { useSizeState } from "../hooks/useSizeState"

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
export function useActions(
    messageId: string | undefined,
    authorId: string | undefined,
    incoming: { reactions: MessageReactionProps[]; status: MessageDeliveryStatus },
): MessageActionsState {
    const { session } = React.useContext(PersistedContext)

    /**
     * Reações e status vêm do dado; o estado local é só a sobrescrita otimista.
     *
     * Antes eram cópias sincronizadas por efeito, e numa lista reciclada isso significa que o
     * primeiro quadro da linha reciclada mostrava as reações e o tique de entrega da mensagem
     * **anterior**. Ver a explicação completa em `data.context.ts`.
     *
     * A sobrescrita é presa ao `messageId`: sem isso, uma reação otimista vazaria de uma
     * mensagem para outra quando a view trocasse de dono.
     */
    // Reagir acrescenta a fileira de pílulas abaixo da bolha, e o estado de envio faz o
    // rodapé aparecer ou sumir: os dois mudam a altura — ver `useSizeState`.
    const [override, setOverride] = useSizeState<{
        messageId: string
        reactions?: MessageReactionProps[]
        status?: MessageDeliveryStatus
    } | null>(null)

    const active = override && messageId && override.messageId === messageId ? override : null
    const reactions = active?.reactions ?? incoming.reactions
    const status = active?.status ?? incoming.status

    const setReactions = React.useCallback<
        React.Dispatch<React.SetStateAction<MessageReactionProps[]>>
    >(
        (value) => {
            if (!messageId) return
            setOverride((previous) => {
                const base = previous && previous.messageId === messageId ? previous : { messageId }
                const current = base.reactions ?? incoming.reactions
                return {
                    ...base,
                    messageId,
                    reactions: typeof value === "function" ? value(current) : value,
                }
            })
        },
        [messageId, incoming.reactions, setOverride],
    )

    const setStatus = React.useCallback<
        React.Dispatch<React.SetStateAction<MessageDeliveryStatus>>
    >(
        (value) => {
            if (!messageId) return
            setOverride((previous) => {
                const base = previous && previous.messageId === messageId ? previous : { messageId }
                const current = base.status ?? incoming.status
                return {
                    ...base,
                    messageId,
                    status: typeof value === "function" ? value(current) : value,
                }
            })
        },
        [messageId, incoming.status, setOverride],
    )

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

    // Memoizado como as outras duas stores: o objeto entra no valor do contexto da mensagem,
    // e identidade nova a cada render faria bolha, texto, rodapé e player re-renderizarem
    // sem nada ter mudado. `setReactions` e `setStatus` são setters de `useState`, já
    // estáveis; `registerAction` é `useCallback`.
    return React.useMemo(
        () => ({ reactions, status, setReactions, setStatus, registerAction }),
        [reactions, status, setReactions, setStatus, registerAction],
    )
}
