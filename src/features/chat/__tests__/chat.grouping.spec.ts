import { describe, expect, it } from "vitest"

import { GROUPING_WINDOW_MS, groupMessages } from "../chat.grouping"
import type { ChatBubbleMessage } from "../chat.types"

const BASE = Date.parse("2026-09-09T12:00:00.000Z")

const msg = (
    id: string,
    mine: boolean,
    offsetMs = 0,
    createdAt: string | undefined = new Date(BASE + offsetMs).toISOString(),
): ChatBubbleMessage => ({ id, text: id, mine, createdAt })

const positions = (messages: ChatBubbleMessage[]) =>
    groupMessages(messages).map((m) => m.groupPosition)

describe("groupMessages", () => {
    it("mensagem isolada é um bloco de uma", () => {
        expect(positions([msg("a", true)])).toEqual(["single"])
    })

    it("lista vazia não quebra", () => {
        expect(groupMessages([])).toEqual([])
    })

    it("três seguidas do mesmo autor formam first/middle/last", () => {
        const messages = [msg("a", true, 0), msg("b", true, 1000), msg("c", true, 2000)]

        expect(positions(messages)).toEqual(["first", "middle", "last"])
    })

    it("troca de autor quebra o bloco", () => {
        const messages = [msg("a", true, 0), msg("b", false, 1000), msg("c", true, 2000)]

        expect(positions(messages)).toEqual(["single", "single", "single"])
    })

    // O corte por tempo é o que impede uma conversa de dias virar um bloco só.
    it("mesmo autor além da janela começa um bloco novo", () => {
        const messages = [msg("a", true, 0), msg("b", true, GROUPING_WINDOW_MS + 1)]

        expect(positions(messages)).toEqual(["single", "single"])
    })

    it("exatamente na borda da janela ainda agrupa", () => {
        const messages = [msg("a", true, 0), msg("b", true, GROUPING_WINDOW_MS)]

        expect(positions(messages)).toEqual(["first", "last"])
    })

    // Falhar para o lado de agrupar: o pior caso é um rabinho a menos, nunca uma bolha
    // atribuída ao lado errado.
    it("sem data legível, agrupa só pelo autor", () => {
        const messages = [msg("a", true, 0, undefined), msg("b", true, 0, "não é data")]

        expect(positions(messages)).toEqual(["first", "last"])
    })

    it("não muda a lista original nem a ordem", () => {
        const messages = [msg("a", true, 0), msg("b", true, 1000)]
        const result = groupMessages(messages)

        expect(messages.every((m) => m.groupPosition === undefined)).toBe(true)
        expect(result.map((m) => m.id)).toEqual(["a", "b"])
    })

    it("preserva os demais campos da mensagem", () => {
        const [only] = groupMessages([{ id: "a", text: "oi", mine: false, status: "sent" }])

        expect(only).toMatchObject({ id: "a", text: "oi", mine: false, status: "sent" })
    })
})
