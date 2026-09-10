import { describe, expect, it } from "vitest"
import type { LocalMessage } from "stream-chat"

import { toMessageData, toMessageList } from "../chat.message.adapter"

const AT = new Date("2026-09-09T12:00:00.000Z")

/** Molde mínimo de `LocalMessage`. O cast existe porque o tipo do Stream tem dezenas de
 * campos opcionais que o adaptador não lê — declarar todos só esconderia o que importa. */
const message = (partial: Partial<LocalMessage> = {}): LocalMessage =>
    ({
        id: "m1",
        cid: "messaging:abc",
        type: "regular",
        text: "oi",
        user: { id: "u1", name: "Marina", image: "https://x/y.jpg" },
        status: "received",
        created_at: AT,
        updated_at: AT,
        deleted_at: null,
        pinned_at: null,
        ...partial,
    }) as unknown as LocalMessage

describe("toMessageData", () => {
    it("traduz os campos básicos", () => {
        expect(toMessageData(message())).toMatchObject({
            id: "m1",
            chatId: "messaging:abc",
            contentType: "text",
            content: "oi",
            status: "sent",
            createdAt: AT.toISOString(),
            author: { id: "u1", name: "Marina", profilePicture: "https://x/y.jpg" },
        })
    })

    it("datas viram ISO, e ausência vira null", () => {
        const data = toMessageData(message({ deleted_at: null }))

        expect(data.createdAt).toBe(AT.toISOString())
        expect(data.deletedAt).toBeNull()
    })

    it("mensagem apagada carrega o carimbo", () => {
        const deletedAt = new Date("2026-09-09T13:00:00.000Z")
        expect(toMessageData(message({ deleted_at: deletedAt })).deletedAt).toBe(
            deletedAt.toISOString(),
        )
    })

    describe("status", () => {
        it.each([
            ["sending", "pending"],
            ["failed", "failed"],
            ["received", "sent"],
        ])("%s vira %s", (streamStatus, expected) => {
            expect(toMessageData(message({ status: streamStatus })).status).toBe(expected)
        })

        // O tipo do Stream é `string` livre: um valor novo não pode sumir com a mensagem.
        it("valor desconhecido cai em sent", () => {
            expect(toMessageData(message({ status: "algo-novo" })).status).toBe("sent")
        })

        it("readByOthers promove sent para read", () => {
            expect(toMessageData(message(), { readByOthers: true }).status).toBe("read")
        })

        // Promover uma falha a "lida" seria mentir sobre o que aconteceu.
        it("readByOthers não promove um envio que falhou", () => {
            expect(
                toMessageData(message({ status: "failed" }), { readByOthers: true }).status,
            ).toBe("failed")
        })
    })

    describe("conteúdo e anexo", () => {
        it("nota de voz vira audio, com waveform e duração", () => {
            const data = toMessageData(
                message({
                    text: "",
                    attachments: [
                        {
                            type: "voiceRecording",
                            asset_url: "https://x/a.m4a",
                            duration: 8,
                            waveform_data: [0.1, 0.9],
                        },
                    ],
                }),
            )

            expect(data.contentType).toBe("audio")
            expect(data.media).toMatchObject({
                url: "https://x/a.m4a",
                duration: 8,
                waveform: [0.1, 0.9],
            })
        })

        it("anexo de arquivo vira document", () => {
            const data = toMessageData(
                message({ attachments: [{ type: "file", asset_url: "https://x/a.pdf" }] }),
            )

            expect(data.contentType).toBe("document")
        })

        it("mensagem de sistema é reconhecida pelo tipo", () => {
            expect(toMessageData(message({ type: "system" })).contentType).toBe("system")
        })

        it("anexo sem url nenhuma não vira media", () => {
            expect(
                toMessageData(message({ attachments: [{ type: "image" }] })).media,
            ).toBeUndefined()
        })

        it("file_size em string vira número", () => {
            const data = toMessageData(
                message({
                    attachments: [
                        { type: "file", asset_url: "https://x/a.pdf", file_size: "2048" },
                    ],
                }),
            )

            expect(data.media?.fileSize).toBe(2048)
        })
    })

    describe("menções", () => {
        // O Stream diz quem foi mencionado, não onde — os índices são recalculados.
        it("calcula os índices procurando @nome no texto", () => {
            const data = toMessageData(
                message({
                    text: "bom dia @Marina, tudo bem?",
                    mentioned_users: [
                        { id: "u2", name: "Marina" },
                    ] as LocalMessage["mentioned_users"],
                }),
            )

            expect(data.mentions).toEqual([{ start: 8, end: 15, userId: "u2", username: "Marina" }])
        })

        it("mencionado que não aparece no texto não vira menção", () => {
            const data = toMessageData(
                message({
                    text: "sem menção aqui",
                    mentioned_users: [
                        { id: "u2", name: "Marina" },
                    ] as LocalMessage["mentioned_users"],
                }),
            )

            expect(data.mentions).toEqual([])
        })

        it("a mesma pessoa mencionada duas vezes é destacada duas vezes", () => {
            const data = toMessageData(
                message({
                    text: "@Marina e @Marina",
                    mentioned_users: [
                        { id: "u2", name: "Marina" },
                    ] as LocalMessage["mentioned_users"],
                }),
            )

            expect(data.mentions).toHaveLength(2)
            expect(data.mentions?.[0].start).toBeLessThan(data.mentions![1].start)
        })
    })

    describe("reações", () => {
        it("agrega por emoji e marca as do usuário", () => {
            const data = toMessageData(
                message({
                    reaction_groups: {
                        "❤️": { count: 2, sum_scores: 2 },
                        "😂": { count: 1, sum_scores: 1 },
                    },
                    own_reactions: [{ type: "❤️" }] as LocalMessage["own_reactions"],
                }),
            )

            expect(data.reactions).toEqual([
                { emoji: "❤️", count: 2, reactedByMe: true },
                { emoji: "😂", count: 1, reactedByMe: false },
            ])
        })

        it("cai para reaction_counts quando não há grupos", () => {
            const data = toMessageData(message({ reaction_counts: { "👍": 3 } }))

            expect(data.reactions).toEqual([{ emoji: "👍", count: 3, reactedByMe: false }])
        })

        it("grupo zerado não vira reação", () => {
            const data = toMessageData(
                message({ reaction_groups: { "❤️": { count: 0, sum_scores: 0 } } }),
            )

            expect(data.reactions).toEqual([])
        })

        it("sem reação nenhuma devolve lista vazia", () => {
            expect(toMessageData(message()).reactions).toEqual([])
        })
    })

    describe("citação", () => {
        it("traduz a mensagem citada", () => {
            const data = toMessageData(
                message({
                    quoted_message: {
                        id: "m0",
                        text: "mensagem original",
                        type: "regular",
                        user: { id: "u9", name: "Rafael" },
                    } as unknown as LocalMessage["quoted_message"],
                }),
            )

            expect(data.replyTo).toMatchObject({
                id: "m0",
                preview: "mensagem original",
                contentType: "text",
                author: { id: "u9", name: "Rafael" },
            })
        })

        it("sem citação, replyTo é null", () => {
            expect(toMessageData(message()).replyTo).toBeNull()
        })
    })

    it("usuário ausente não quebra a tradução", () => {
        const data = toMessageData(message({ user: null }))

        expect(data.author).toMatchObject({ id: "", name: null, profilePicture: null })
    })
})

describe("toMessageList", () => {
    it("preserva a ordem recebida", () => {
        const list = toMessageList([message({ id: "a" }), message({ id: "b" })])

        expect(list.map((m) => m.id)).toEqual(["a", "b"])
    })

    it("aplica as opções a todas as mensagens", () => {
        const list = toMessageList([message({ id: "a" }), message({ id: "b" })], {
            readByOthers: true,
        })

        expect(list.every((m) => m.status === "read")).toBe(true)
    })
})
