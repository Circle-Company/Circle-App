import React from "react"

import { MessageReciveDataProps } from "../message.types"
import { useSizeState } from "../hooks/useSizeState"

export interface MessageDataState extends MessageReciveDataProps {
    set: (data: MessageReciveDataProps) => void
    get: () => MessageReciveDataProps
}

/**
 * Os dados da mensagem, com uma camada de edição otimista por cima.
 *
 * **O dado que vale é o que chega por prop.** O estado local guarda apenas a sobrescrita
 * otimista — texto recém-editado, reação recém-adicionada — enquanto a lista externa não
 * reconcilia.
 *
 * A versão anterior mantinha uma cópia em estado, sincronizada por efeito. Numa lista
 * virtualizada isso é um defeito visível: a FlashList **recicla** a view, o React reaproveita
 * a mesma instância do componente, e o estado sobrevive à troca. O primeiro quadro da linha
 * reciclada desenhava a mensagem **anterior**, e só o efeito seguinte corrigia — na rolagem
 * rápida isso aparece como texto piscando e conteúdo trocado.
 *
 * Derivar no render elimina a janela: a linha nasce certa.
 */
export function useData(incoming: MessageReciveDataProps): MessageDataState {
    // Texto editado muda a altura da bolha — ver `useSizeState`.
    const [override, setOverride] = useSizeState<MessageReciveDataProps | null>(null)

    /**
     * A sobrescrita pertence a **uma** mensagem.
     *
     * Comparar o id é o que impede o dado de vazar de uma mensagem para outra quando a view
     * é reciclada: sem isso, a edição otimista de quem saiu da tela apareceria em quem
     * entrou.
     */
    const current = override && override.id === incoming.id ? override : incoming

    const set = React.useCallback(
        (next: MessageReciveDataProps) => {
            setOverride(next)
        },
        [setOverride],
    )

    const get = React.useCallback(() => current, [current])

    /**
     * Memoizado: este objeto entra no valor do contexto da mensagem, e identidade nova a cada
     * render re-renderizaria bolha, texto, rodapé e player sem nada ter mudado.
     */
    return React.useMemo(() => ({ ...current, set, get }), [current, set, get])
}
