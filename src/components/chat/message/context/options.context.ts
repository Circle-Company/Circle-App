import React from "react"

import { MessageOptionsProps } from "../message.types"
import { useSizeState } from "../hooks/useSizeState"

export interface MessageOptionsState extends MessageOptionsProps {
    setIsSelected: React.Dispatch<React.SetStateAction<boolean>>
    set: (options: MessageOptionsProps) => void
    get: () => MessageOptionsProps
}

/**
 * As opções da mensagem, derivadas no render.
 *
 * Só a seleção é estado de verdade: ela nasce do toque longo, não do dado. Todo o resto vem
 * calculado pelo provider a partir das props.
 *
 * Manter uma cópia em estado, sincronizada por efeito, era um defeito numa lista reciclada.
 * A FlashList reaproveita a view e o React reaproveita a instância, então o estado sobrevive
 * à troca de mensagem: o primeiro quadro da linha reciclada desenhava as opções da mensagem
 * anterior — lado errado da bolha, cantos errados, avatar onde não devia — e só o efeito
 * seguinte corrigia. Na rolagem rápida isso aparece como espaçamento mudando e conteúdo
 * piscando. A mesma explicação vale para `data.context.ts`.
 */
export function useOptions(computed: MessageOptionsProps): MessageOptionsState {
    /**
     * A seleção é presa à mensagem que foi selecionada.
     *
     * Guardar o `messageType` em vez de um booleano é o que impede a seleção de ser herdada
     * quando a view é reciclada para outra mensagem: o formato muda, e a seleção cai
     * sozinha. Na prática o menu fecha ao rolar, que é o esperado.
     */
    /*
     * Muda o tamanho: a bolha selecionada ganha `borderWidth: 1`, ou seja, 2px a mais em cada
     * eixo. Daí `useSizeState` — ver o hook.
     */
    const [selectedType, setSelectedType] = useSizeState<string | null>(null)
    const isSelected = selectedType !== null && selectedType === computed.messageType

    const setIsSelected: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback(
        (value) => {
            setSelectedType((previous) => {
                const next = typeof value === "function" ? value(previous !== null) : value
                return next ? computed.messageType : null
            })
        },
        [computed.messageType, setSelectedType],
    )

    const current = React.useMemo(
        () => (computed.isSelected === isSelected ? computed : { ...computed, isSelected }),
        [computed, isSelected],
    )

    /**
     * Mantido pela assinatura pública, mas sem efeito.
     *
     * As opções passaram a ser derivadas; escrever aqui recriaria a cópia em estado que este
     * arquivo existe para eliminar. Quem precisa mudar uma opção muda a prop `options` do
     * `MessageProvider`.
     */
    const set = React.useCallback((_options: MessageOptionsProps) => {}, [])

    const get = React.useCallback(() => current, [current])

    return React.useMemo(
        () => ({ ...current, setIsSelected, set, get }),
        [current, setIsSelected, set, get],
    )
}
