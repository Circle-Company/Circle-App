import React from "react"

import { MessageReciveDataProps } from "../message.types"

export interface MessageDataState extends MessageReciveDataProps {
    set: (data: MessageReciveDataProps) => void
    get: () => MessageReciveDataProps
}

/**
 * Espelho local dos dados da mensagem.
 *
 * Existe pelo mesmo motivo do `useData` do moment: os componentes filhos leem
 * campo a campo pelo contexto e alguns deles precisam refletir uma edição
 * otimista (texto editado, reação recém-adicionada) antes de a lista externa
 * ser reconciliada.
 */
export function useData(): MessageDataState {
    const [data, setData] = React.useState<MessageReciveDataProps>({} as MessageReciveDataProps)

    function get(): MessageReciveDataProps {
        return data
    }

    // Estável entre renders: o provider usa `set` como dependência de efeito, e
    // uma função nova a cada render faria o efeito rodar sempre.
    const set = React.useCallback((newData: MessageReciveDataProps) => {
        setData(newData)
    }, [])

    return {
        ...data,
        set,
        get,
    }
}
