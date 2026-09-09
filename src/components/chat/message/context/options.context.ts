import React from "react"

import { MessageOptionsProps } from "../message.types"

export interface MessageOptionsState extends MessageOptionsProps {
    setIsSelected: React.Dispatch<React.SetStateAction<boolean>>
    set: (options: MessageOptionsProps) => void
    get: () => MessageOptionsProps
}

const initialOptions: MessageOptionsProps = {
    messageType: "text",
    isMine: false,
    isGroup: false,
    isFirstOfGroup: true,
    isLastOfGroup: true,
    isSelected: false,
    enableReply: true,
    enableForward: true,
    enableCopy: true,
    enableEdit: false,
    enablePin: true,
    enableDelete: false,
    enableReactions: true,
}

export function useOptions(): MessageOptionsState {
    const [options, setOptions] = React.useState<MessageOptionsProps>(initialOptions)

    const setIsSelected: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback(
        (value) => {
            setOptions((previous) => ({
                ...previous,
                isSelected: typeof value === "function" ? value(previous.isSelected) : value,
            }))
        },
        [],
    )

    function get(): MessageOptionsProps {
        return options
    }

    /**
     * Estável entre renders (o provider a usa como dependência de efeito) e com
     * saída antecipada quando nada mudou.
     *
     * A comparação rasa não é otimização: o provider monta um objeto novo a cada
     * chamada, e sem ela um `set` com os mesmos valores dispararia um render, que
     * dispararia o efeito de novo. As opções são todas primitivas, então rasa
     * basta.
     */
    const set = React.useCallback((newOptions: MessageOptionsProps) => {
        setOptions((previous) => {
            const keys = Object.keys(newOptions) as (keyof MessageOptionsProps)[]
            const unchanged = keys.every((key) => previous[key] === newOptions[key])
            return unchanged ? previous : newOptions
        })
    }, [])

    return {
        ...options,
        setIsSelected,
        set,
        get,
    }
}
