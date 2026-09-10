import React from "react"
import type { Channel, Event, StreamChat } from "stream-chat"

/**
 * O padrão de leitura do chat: **ler do SDK, re-renderizar por evento**.
 *
 * O `stream-chat` já mantém canais, mensagens, leituras e presença em memória, e os atualiza
 * sozinho a cada evento do WebSocket. Copiar isso para outro estado — Zustand, React Query,
 * `useState` — cria uma segunda verdade que diverge da primeira no primeiro evento perdido.
 *
 * Então nada é copiado: este hook só conta eventos. O contador muda, o componente renderiza,
 * e na renderização lê do objeto do SDK, que já está atualizado. O valor devolvido não
 * significa nada — serve como dependência de `useMemo`, e é só isso.
 */
type EventSource = Pick<StreamChat, "on"> | Pick<Channel, "on">

export function useEventVersion(
    source: EventSource | null | undefined,
    accept: (event: Event) => boolean = () => true,
): number {
    const [version, bump] = React.useReducer((n: number) => n + 1, 0)

    /*
     * O filtro vive numa ref, e não nas dependências do efeito.
     *
     * Quem chama escreve o filtro como literal — `(e) => e.type === "typing.start"` —, que
     * nasce novo a cada render. Nas dependências, isso desinscreveria e reinscreveria o
     * listener a cada render, e um evento chegando entre as duas operações se perderia.
     */
    const acceptRef = React.useRef(accept)
    /*
     * A escrita acontece no render, e não num efeito, de propósito: um evento pode chegar
     * entre o render e o efeito, e nessa janela o filtro velho ainda estaria valendo. O
     * lint pede para não tocar em ref durante o render — a exceção é exatamente este padrão,
     * em que a ref é só um espelho da última prop e não influencia o que se desenha.
     */
    // eslint-disable-next-line react-hooks/refs
    acceptRef.current = accept

    React.useEffect(() => {
        if (!source) return

        const subscription = source.on((event: Event) => {
            if (acceptRef.current(event)) bump()
        })

        return () => subscription.unsubscribe()
    }, [source])

    return version
}
