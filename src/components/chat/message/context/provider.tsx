import React, { useEffect, useMemo } from "react"

import PersistedContext from "@/contexts/Persisted"
import { MessageProviderProps } from "../message.types"
import { MessageContextsData } from "./types"
import { messageSizes } from "../message.sizes"
import { useActions } from "./actions.context"
import { useData } from "./data.context"
import { useOptions } from "./options.context"
import { resolveMessageType } from "../helpers/resolveMessageType"

const MessageContext = React.createContext<MessageContextsData>({} as MessageContextsData)

export function MessageProvider({
    children,
    data,
    options,
    size = messageSizes.standart,
}: MessageProviderProps) {
    const { session } = React.useContext(PersistedContext)

    const DataStore = useData()
    const OptionsStore = useOptions()
    const ActionsStore = useActions(data.id, data.author?.id)

    // Desestruturados porque são estáveis (`useCallback` / setter de `useState`) e
    // entram nas dependências dos efeitos abaixo. Depender do objeto da store
    // inteiro faria o efeito rodar a cada render, já que ela é remontada sempre.
    const { set: setData } = DataStore
    const { set: setOptions } = OptionsStore
    const { setReactions, setStatus } = ActionsStore

    const {
        messageType,
        isGroup = false,
        isFirstOfGroup = true,
        isLastOfGroup = true,
        isSelected = false,
    } = options ?? {}

    const isMine = data.author?.id
        ? String(session.account.userId) === String(data.author.id)
        : false
    const isDeleted = !!data.deletedAt
    // Derivado do próprio dado, salvo quando quem renderiza impõe outro. Calculado
    // no render (é função pura) para o efeito abaixo depender de um valor
    // primitivo, em vez da identidade do objeto `data`.
    const resolvedType = messageType ?? resolveMessageType(data)

    useEffect(() => {
        setData(data)
        setReactions(data.reactions ?? [])
        setStatus(data.status)
    }, [data, setData, setReactions, setStatus])

    useEffect(() => {
        setOptions({
            messageType: resolvedType,
            isMine,
            isGroup,
            isFirstOfGroup,
            isLastOfGroup,
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
        })
    }, [
        setOptions,
        resolvedType,
        isMine,
        isGroup,
        isFirstOfGroup,
        isLastOfGroup,
        isSelected,
        isDeleted,
        data.contentType,
    ])

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
