import { ChatRow, ChatSequence, isDivider } from "../chat.list.types"

/**
 * Resolve a posição de cada mensagem na sequência do mesmo autor.
 *
 * É trabalho da lista, e não da mensagem: só quem enxerga os vizinhos sabe se
 * uma bolha abre, continua ou fecha um bloco. A mensagem recebe o resultado e
 * usa para decidir cantos, avatar e rodapé.
 *
 * Um divisor (virada de dia, aviso do sistema) **interrompe** a sequência: duas
 * mensagens do mesmo autor separadas por "HOJE" pertencem a dias diferentes, e
 * emendá-las num bloco só esconderia isso.
 *
 * A chave do mapa é o id da mensagem; divisores não entram.
 */
export function resolveSequence(rows: ChatRow[]): Map<string, ChatSequence> {
    const sequence = new Map<string, ChatSequence>()

    rows.forEach((row, index) => {
        if (isDivider(row)) return

        const previous = rows[index - 1]
        const next = rows[index + 1]

        const continues = (other?: ChatRow) =>
            !!other && !isDivider(other) && other.author?.id === row.author?.id

        sequence.set(row.id, {
            isFirstOfGroup: !continues(previous),
            isLastOfGroup: !continues(next),
        })
    })

    return sequence
}
