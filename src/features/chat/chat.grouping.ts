import type { BubbleGroupPosition, ChatBubbleMessage } from "./chat.types"

/**
 * Janela em que duas mensagens do mesmo autor ainda contam como o mesmo bloco.
 *
 * O iMessage não agrupa só por autor: duas mensagens da mesma pessoa separadas por horas são
 * dois blocos, não um. Sem esse corte, uma conversa de dias inteiros viraria um bloco só, com
 * um único rabinho lá embaixo.
 */
export const GROUPING_WINDOW_MS = 60_000

const timeOf = (message: ChatBubbleMessage): number | null => {
    if (!message.createdAt) return null
    const parsed = Date.parse(message.createdAt)
    return Number.isFinite(parsed) ? parsed : null
}

/** Duas mensagens pertencem ao mesmo bloco quando são do mesmo lado e próximas no tempo. */
function sameGroup(a: ChatBubbleMessage, b: ChatBubbleMessage): boolean {
    if (a.mine !== b.mine) return false

    const ta = timeOf(a)
    const tb = timeOf(b)
    // Sem data legível dos dois lados não dá para decidir pelo tempo. Agrupar só pelo autor
    // é o lado seguro: o pior caso é um rabinho a menos, não uma bolha no lado errado.
    if (ta === null || tb === null) return true

    return Math.abs(tb - ta) <= GROUPING_WINDOW_MS
}

/**
 * Calcula a posição de cada mensagem no seu bloco.
 *
 * A lista entra em ordem cronológica (mais antiga primeiro) e sai com `groupPosition`
 * preenchido — é o que a bolha usa para decidir cantos e rabinho.
 *
 * Fica separado do componente porque é lógica pura: dá para testar sem renderizar nada, que
 * é a única forma de teste que este projeto suporta (ver CLAUDE.md > Testing).
 */
export function groupMessages(messages: ChatBubbleMessage[]): ChatBubbleMessage[] {
    return messages.map((message, index) => {
        const previous = index > 0 ? messages[index - 1] : undefined
        const next = index < messages.length - 1 ? messages[index + 1] : undefined

        const attachedAbove = previous ? sameGroup(previous, message) : false
        const attachedBelow = next ? sameGroup(message, next) : false

        let groupPosition: BubbleGroupPosition
        if (attachedAbove && attachedBelow) groupPosition = "middle"
        else if (attachedAbove) groupPosition = "last"
        else if (attachedBelow) groupPosition = "first"
        else groupPosition = "single"

        return { ...message, groupPosition }
    })
}
