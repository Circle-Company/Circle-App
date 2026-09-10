import type { ChatRow } from "@/components/chat/list"
import type { MessageReciveDataProps } from "@/components/chat/message"

/**
 * As viradas de dia entre as mensagens.
 *
 * A lista da conversa aceita mensagens e divisores misturados, e é quem monta as linhas que
 * decide onde o dia vira — o Stream não manda isso, e nem deveria: "hoje" depende do fuso do
 * aparelho e do idioma de quem lê.
 *
 * Função pura, e por isso testável: renderizar árvore não funciona sob o vitest neste projeto
 * (CLAUDE.md > Testing), então a regra fica fora do componente.
 */

/** Chave do dia local de uma data ISO — `2026-09-10`. */
export function dayKeyOf(iso: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ""

    // Componentes locais, e não `toISOString()`: perto da meia-noite o UTC cai no dia
    // seguinte, e a conversa ganharia uma virada de dia no meio de uma sequência de
    // mensagens da mesma noite.
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Intercala um divisor de data a cada virada de dia.
 *
 * O rótulo vem de fora (`labelFor`) porque formatá-lo exige o idioma da sessão, e esta camada
 * não conhece o `LanguageContext`. As mensagens precisam chegar em ordem cronológica — é como
 * o `channel.state.messages` já as entrega.
 */
export function withDateDividers(
    messages: MessageReciveDataProps[],
    labelFor: (iso: string) => string,
): ChatRow[] {
    const rows: ChatRow[] = []
    let currentDay = ""

    for (const message of messages) {
        const day = dayKeyOf(message.createdAt)

        if (day && day !== currentDay) {
            currentDay = day
            rows.push({ kind: "date", id: `date-${day}`, label: labelFor(message.createdAt) })
        }

        rows.push(message)
    }

    return rows
}
