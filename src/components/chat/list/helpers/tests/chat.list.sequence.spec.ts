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

        expect(sequence.get("m1")).toEqual({
            isFirstOfGroup: true,
            isLastOfGroup: true,
            followsAudio: false,
        })
    })

    it("encadeia mensagens seguidas do mesmo autor", () => {
        const sequence = resolveSequence([
            message("m1", "a"),
            message("m2", "a"),
            message("m3", "a"),
        ])

        expect(sequence.get("m1")).toEqual({
            isFirstOfGroup: true,
            isLastOfGroup: false,
            followsAudio: false,
        })
        expect(sequence.get("m2")).toEqual({
            isFirstOfGroup: false,
            isLastOfGroup: false,
            followsAudio: false,
        })
        expect(sequence.get("m3")).toEqual({
            isFirstOfGroup: false,
            isLastOfGroup: true,
            followsAudio: false,
        })
    })

    it("quebra o bloco quando o autor muda", () => {
        const sequence = resolveSequence([message("m1", "a"), message("m2", "b")])

        expect(sequence.get("m1")).toEqual({
            isFirstOfGroup: true,
            isLastOfGroup: true,
            followsAudio: false,
        })
        expect(sequence.get("m2")).toEqual({
            isFirstOfGroup: true,
            isLastOfGroup: true,
            followsAudio: false,
        })
    })

    it("um divisor interrompe a sequência do mesmo autor", () => {
        // Duas mensagens do mesmo autor separadas por uma virada de dia são de
        // dias diferentes: emendá-las num bloco só esconderia isso.
        const sequence = resolveSequence([message("m1", "a"), dateDivider, message("m2", "a")])

        expect(sequence.get("m1")).toEqual({
            isFirstOfGroup: true,
            isLastOfGroup: true,
            followsAudio: false,
        })
        expect(sequence.get("m2")).toEqual({
            isFirstOfGroup: true,
            isLastOfGroup: true,
            followsAudio: false,
        })
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

    describe("followsAudio", () => {
        const audio = (id: string, authorId: string): ChatRow =>
            ({ ...(message(id, authorId) as any), contentType: "audio", content: null }) as ChatRow

        it("marca a mensagem logo abaixo de uma nota de voz do mesmo autor", () => {
            const sequence = resolveSequence([audio("m1", "a"), message("m2", "a")])

            expect(sequence.get("m2")?.followsAudio).toBe(true)
        })

        it("não marca quando a nota de voz é de outro autor", () => {
            const sequence = resolveSequence([audio("m1", "a"), message("m2", "b")])

            expect(sequence.get("m2")?.followsAudio).toBe(false)
        })

        // Um divisor entre as duas já quebra o bloco: o respiro viria em dobro.
        it("não marca através de um divisor", () => {
            const sequence = resolveSequence([audio("m1", "a"), dateDivider, message("m2", "a")])

            expect(sequence.get("m2")?.followsAudio).toBe(false)
        })

        // Áudio apagado vira lápide: baixa, sem player e sem avatar. O respiro depois dela
        // sobraria.
        it("não marca quando a nota de voz anterior foi apagada", () => {
            const deleted = { ...(audio("m1", "a") as any), deletedAt: "2026-01-01T00:00:00.000Z" }
            const sequence = resolveSequence([deleted as ChatRow, message("m2", "a")])

            expect(sequence.get("m2")?.followsAudio).toBe(false)
        })

        it("a própria nota de voz não é marcada", () => {
            const sequence = resolveSequence([message("m1", "a"), audio("m2", "a")])

            expect(sequence.get("m2")?.followsAudio).toBe(false)
        })
    })
})
