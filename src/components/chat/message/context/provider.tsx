import React, { useMemo } from "react"

import PersistedContext from "@/contexts/Persisted"
import { MessageOptionsProps, MessageProviderProps } from "../message.types"
import { MessageContextsData } from "./types"
import { messageSizes } from "../message.sizes"
import { useActions } from "./actions.context"
import { useData } from "./data.context"
import { useOptions } from "./options.context"
import { resolveMessageType } from "../helpers/resolveMessageType"

const MessageContext = React.createContext<MessageContextsData>({} as MessageContextsData)

/**
 * O provider da mensagem.
 *
 * **Tudo é derivado no render; não há sincronização por efeito.** A versão anterior copiava
 * `data`, `options`, `reactions` e `status` para estado dentro de efeitos. Numa lista
 * virtualizada isso produz um defeito visível: a FlashList recicla a view, o React reaproveita
 * a instância, e o estado sobrevive à troca de mensagem — então o primeiro quadro da linha
 * reciclada desenhava a mensagem anterior, com o lado e o espaçamento errados, e só o efeito
 * seguinte corrigia. Na rolagem rápida isso aparece como texto piscando, view esticando e
 * espaçamento mudando sozinho.
 *
 * Derivar no render fecha essa janela: a linha nasce certa, e cada troca custa um render em
 * vez de dois.
 */
export function MessageProvider({
    children,
    data,
    options,
    size = messageSizes.standart,
}: MessageProviderProps) {
    const { session } = React.useContext(PersistedContext)

    const {
        messageType,
        isMine: isMineOverride,
        isGroup = false,
        isFirstOfGroup = true,
        isLastOfGroup = true,
        followsAudio = false,
        // Sem a lista dizendo o contrário, presume-se que não há nada mais novo:
        // uma mensagem renderizada sozinha é a mais recente que existe.
        isLatest = true,
        isSelected = false,
    } = options ?? {}

    /*
     * Sem `isMine` imposto de fora, a resposta vem da sessão. É o certo numa conversa de
     * verdade, e é frágil quando não há sessão carregada: aí nenhuma mensagem é minha, e a
     * conversa inteira desenha do lado de quem recebe.
     */
    const isMine =
        isMineOverride ??
        (data.author?.id ? String(session.account.userId) === String(data.author.id) : false)
    const isDeleted = !!data.deletedAt
    // Derivado do próprio dado, salvo quando quem renderiza impõe outro.
    const resolvedType = messageType ?? resolveMessageType(data)

    /**
     * As opções completas, calculadas a partir das props.
     *
     * Memoizado sobre valores primitivos — e não sobre a identidade de `data` — para o objeto
     * só nascer novo quando alguma decisão de fato mudar.
     */
    const computedOptions = useMemo<MessageOptionsProps>(
        () => ({
            messageType: resolvedType,
            isMine,
            isGroup,
            isFirstOfGroup,
            isLastOfGroup,
            followsAudio,
            isLatest,
            isSelected,
            // Mensagem apagada vira lápide: nenhuma ação além de ler.
            enableReply: !isDeleted,
            enableForward: !isDeleted,
            enableCopy: !isDeleted && data.contentType === "text",
            // Só o autor edita, e só texto.
            enableEdit: isMine && !isDeleted && data.contentType === "text",
            enablePin: !isDeleted,
            enableDelete: isMine && !isDeleted,
            enableReactions: !isDeleted,
        }),
        [
            resolvedType,
            isMine,
            isGroup,
            isFirstOfGroup,
            isLastOfGroup,
            followsAudio,
            isLatest,
            isSelected,
            isDeleted,
            data.contentType,
        ],
    )

    const incomingActions = useMemo(
        () => ({ reactions: data.reactions ?? [], status: data.status }),
        [data.reactions, data.status],
    )

    const DataStore = useData(data)
    const OptionsStore = useOptions(computedOptions)
    const ActionsStore = useActions(data.id, data.author?.id, incomingActions)

    const contextValue = useMemo<MessageContextsData>(
        () => ({
            size,
            data: DataStore,
            options: OptionsStore,
            actions: ActionsStore,
        }),
        [size, DataStore, OptionsStore, ActionsStore],
    )

    return <MessageContext.Provider value={contextValue}>{children}</MessageContext.Provider>
}

export default MessageContext
