import { describe, expect, it } from "vitest"

import type { MessageReciveDataProps } from "@/components/chat/message"
// Do módulo de tipos, e não do index da lista: o index arrasta React Native, cuja fonte em
// Flow o vitest não consegue transformar (CLAUDE.md > Testing).
import { isDivider } from "@/components/chat/list/chat.list.types"

import { dayKeyOf, withDateDividers } from "../chat.rows"

const message = (id: string, createdAt: string): MessageReciveDataProps => ({
    id,
    chatId: "messaging:c1",
    author: { id: "1", username: "a", name: null, profilePicture: null },
    contentType: "text",
    content: id,
    mentions: [],
    reactions: [],
    replyTo: null,
    status: "sent",
    createdAt,
    editedAt: null,
    deletedAt: null,
    pinned: false,
})

const label = (iso: string) => dayKeyOf(iso)

describe("dayKeyOf", () => {
    it("usa o dia local, não o UTC", () => {
        // 23h em UTC-3 é o dia seguinte em UTC. Usar o UTC criaria uma virada de dia no meio
        // de uma sequência de mensagens da mesma noite.
        const local = new Date(2026, 8, 10, 23, 30)
        expect(dayKeyOf(local.toISOString())).toBe("2026-09-10")
    })

    it("devolve vazio para data inválida em vez de quebrar", () => {
        expect(dayKeyOf("não é data")).toBe("")
    })
})

describe("withDateDividers", () => {
    it("não insere nada numa lista vazia", () => {
        expect(withDateDividers([], label)).toEqual([])
    })

    it("põe um divisor antes da primeira mensagem", () => {
        const rows = withDateDividers(
            [message("m1", new Date(2026, 8, 10, 9).toISOString())],
            label,
        )

        expect(rows).toHaveLength(2)
        expect(isDivider(rows[0])).toBe(true)
    })

    it("insere um divisor por virada de dia, e só por virada", () => {
        const rows = withDateDividers(
            [
                message("m1", new Date(2026, 8, 10, 9).toISOString()),
                message("m2", new Date(2026, 8, 10, 22).toISOString()),
                message("m3", new Date(2026, 8, 11, 8).toISOString()),
            ],
            label,
        )

        // Duas viradas (dia 10 e dia 11) + três mensagens.
        expect(rows).toHaveLength(5)
        expect(rows.filter(isDivider)).toHaveLength(2)
        expect(isDivider(rows[0]) && rows[0].id).toBe("date-2026-09-10")
        expect(isDivider(rows[3]) && rows[3].id).toBe("date-2026-09-11")
    })

    it("preserva a ordem das mensagens", () => {
        const rows = withDateDividers(
            [
                message("m1", new Date(2026, 8, 10, 9).toISOString()),
                message("m2", new Date(2026, 8, 11, 9).toISOString()),
            ],
            label,
        )

        const ids = rows.filter((row) => !isDivider(row)).map((row) => row.id)
        expect(ids).toEqual(["m1", "m2"])
    })

    it("ignora a data inválida sem abrir um divisor vazio", () => {
        const rows = withDateDividers([message("m1", "quebrado")], label)

        expect(rows).toHaveLength(1)
        expect(isDivider(rows[0])).toBe(false)
    })
})
