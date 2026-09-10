import { describe, expect, it } from "vitest"

import { ChatRow } from "../../chat.list.types"
import { resolveSequence } from "../chat.list.sequence"

const message = (id: string, authorId: string): ChatRow =>
    ({
        id,
        chatId: "c",
        author: { id: authorId, username: authorId, name: authorId, profilePicture: null },
        contentType: "text",
        content: id,
        status: "sent",
        createdAt: "2026-09-09T14:00:00.000Z",
    }) as ChatRow

const dateDivider: ChatRow = { kind: "date", id: "d1", label: "Hoje" }
const systemDivider: ChatRow = { kind: "system", id: "s1", text: "Rafael entrou no grupo" }

describe("resolveSequence", () => {
    it("marca uma mensagem isolada como início e fim do bloco", () => {
        const sequence = resolveSequence([message("m1", "a")])

        expect(sequence.get("m1")).toEqual({ isFirstOfGroup: true, isLastOfGroup: true })
    })

    it("encadeia mensagens seguidas do mesmo autor", () => {
        const sequence = resolveSequence([
            message("m1", "a"),
            message("m2", "a"),
            message("m3", "a"),
        ])

        expect(sequence.get("m1")).toEqual({ isFirstOfGroup: true, isLastOfGroup: false })
        expect(sequence.get("m2")).toEqual({ isFirstOfGroup: false, isLastOfGroup: false })
        expect(sequence.get("m3")).toEqual({ isFirstOfGroup: false, isLastOfGroup: true })
    })

    it("quebra o bloco quando o autor muda", () => {
        const sequence = resolveSequence([message("m1", "a"), message("m2", "b")])

        expect(sequence.get("m1")).toEqual({ isFirstOfGroup: true, isLastOfGroup: true })
        expect(sequence.get("m2")).toEqual({ isFirstOfGroup: true, isLastOfGroup: true })
    })

    it("um divisor interrompe a sequência do mesmo autor", () => {
        // Duas mensagens do mesmo autor separadas por uma virada de dia são de
        // dias diferentes: emendá-las num bloco só esconderia isso.
        const sequence = resolveSequence([message("m1", "a"), dateDivider, message("m2", "a")])

        expect(sequence.get("m1")).toEqual({ isFirstOfGroup: true, isLastOfGroup: true })
        expect(sequence.get("m2")).toEqual({ isFirstOfGroup: true, isLastOfGroup: true })
    })

    it("vale também para o aviso de sistema", () => {
        const sequence = resolveSequence([message("m1", "a"), systemDivider, message("m2", "a")])

        expect(sequence.get("m2")?.isFirstOfGroup).toBe(true)
    })

    it("não devolve entrada para divisores", () => {
        const sequence = resolveSequence([dateDivider, message("m1", "a"), systemDivider])

        expect(sequence.has("d1")).toBe(false)
        expect(sequence.has("s1")).toBe(false)
        expect(sequence.size).toBe(1)
    })

    it("devolve mapa vazio para lista vazia", () => {
        expect(resolveSequence([]).size).toBe(0)
    })
})
