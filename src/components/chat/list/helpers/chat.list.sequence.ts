import { ChatRow, ChatSequence, isDivider } from "../chat.list.types"
import { resolveMessageType } from "../../message/helpers/resolveMessageType"

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

        /*
         * Só conta se for do mesmo autor: nota de voz de outra pessoa já abre bloco novo, e o
         * respiro maior viria em dobro.
         *
         * E o que vale é o formato **desenhado**, não o `contentType` cru: uma nota de voz
         * apagada vira lápide — baixa, sem player e sem avatar — e o respiro depois dela
         * ficaria sobrando. Quem decide isso é o mesmo `resolveMessageType` que a mensagem usa
         * para escolher o que renderizar; ler o campo cru aqui era divergir dela.
         */
        const followsAudio =
            continues(previous) &&
            !isDivider(previous!) &&
            resolveMessageType(previous!) === "audio"

        sequence.set(row.id, {
            isFirstOfGroup: !continues(previous),
            isLastOfGroup: !continues(next),
            followsAudio,
        })
    })

    return sequence
}
