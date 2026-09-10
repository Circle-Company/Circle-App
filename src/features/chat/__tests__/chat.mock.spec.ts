import { describe, expect, it } from "vitest"

import { isDivider } from "@/components/chat/list/chat.list.types"
import type { MessageReciveDataProps } from "@/components/chat/message"

import { MOCK_CONVERSATIONS, isMockGroupChat, mockMessages } from "../chat.mock"

const ME = "user-logado"

const CHATS = ["messaging:mock-1", "messaging:mock-2", "messaging:mock-3", "messaging:mock-7"]

const rowsOf = (cid: string) => mockMessages(cid, ME)
const messagesOf = (cid: string): MessageReciveDataProps[] =>
    rowsOf(cid).filter((row): row is MessageReciveDataProps => !isDivider(row))

const allMessages = (): MessageReciveDataProps[] => CHATS.flatMap(messagesOf)

/**
 * Guarda-corpo do mock da conversa.
 *
 * Duas coisas justificam testar dado falso. A primeira: a tela busca as mensagens por `cid`,
 * e o `cid` chega percent-encodado da navegação — o lookup falhava em silêncio e a conversa
 * vinha vazia, o que na tela parecia bug de layout. A segunda: o mock existe para exercitar
 * os estados do componente, e um caso que some sem ninguém notar é um estado que deixa de
 * ser testado a olho.
 */
describe("mockMessages", () => {
    it("devolve linhas para todas as conversas declaradas", () => {
        for (const cid of CHATS) {
            expect(rowsOf(cid).length, `sem linhas para ${cid}`).toBeGreaterThan(0)
        }
    })

    it("cid desconhecido devolve lista vazia em vez de quebrar", () => {
        expect(mockMessages("messaging:não-existe", ME)).toEqual([])
    })

    // O sintoma original: chave codificada não bate, e a conversa aparece vazia.
    it("cid percent-encodado não encontra nada — a tela precisa decodificar antes", () => {
        expect(mockMessages("messaging%3Amock-1", ME)).toEqual([])
    })

    it("toda conversa do grid tem cid no formato do Stream", () => {
        for (const preview of MOCK_CONVERSATIONS) {
            expect(preview.cid).toMatch(/^messaging:/)
        }
    })

    describe("forma dos dados", () => {
        it("toda mensagem traz os campos obrigatórios preenchidos", () => {
            for (const message of allMessages()) {
                expect(message.id, "id").toBeTruthy()
                expect(message.chatId, `chatId de ${message.id}`).toBeTruthy()
                expect(message.author?.id, `author.id de ${message.id}`).toBeTruthy()
                expect(message.status, `status de ${message.id}`).toBeTruthy()
                // `createdAt` alimenta o horário revelado no arrasto: sem data legível ele some.
                expect(
                    Number.isFinite(Date.parse(message.createdAt)),
                    `createdAt de ${message.id} não é data`,
                ).toBe(true)
            }
        })

        it("ids são únicos dentro de cada conversa", () => {
            for (const cid of CHATS) {
                const ids = rowsOf(cid).map((row) => row.id)
                expect(new Set(ids).size, `ids repetidos em ${cid}`).toBe(ids.length)
            }
        })

        it("mensagem de texto viva sempre tem conteúdo", () => {
            const texts = allMessages().filter((m) => m.contentType === "text" && !m.deletedAt)
            for (const message of texts) {
                expect(message.content, `content de ${message.id}`).toBeTruthy()
            }
        })

        it("mensagem com mídia declara url", () => {
            const media = allMessages().filter((m) => m.contentType !== "text" && !m.deletedAt)
            expect(media.length).toBeGreaterThan(0)
            for (const message of media) {
                expect(message.media?.url, `media.url de ${message.id}`).toBeTruthy()
            }
        })
    })

    /**
     * Cada caso abaixo corresponde a um estado que o componente sabe desenhar. Se um deles
     * sair do mock, o estado deixa de aparecer na tela — e ninguém percebe até alguém
     * reclamar que "sumiu".
     */
    describe("cobertura de estados", () => {
        const has = (predicate: (m: MessageReciveDataProps) => boolean) =>
            allMessages().some(predicate)

        it.each([
            ["resposta citada", (m: MessageReciveDataProps) => !!m.replyTo],
            ["citação de áudio", (m: MessageReciveDataProps) => m.replyTo?.contentType === "audio"],
            [
                "reação minha",
                (m: MessageReciveDataProps) => !!m.reactions?.some((r) => r.reactedByMe),
            ],
            [
                "reação de outra pessoa",
                (m: MessageReciveDataProps) => !!m.reactions?.some((r) => !r.reactedByMe),
            ],
            [
                "várias reações na mesma mensagem",
                (m: MessageReciveDataProps) => (m.reactions?.length ?? 0) > 1,
            ],
            ["editada", (m: MessageReciveDataProps) => !!m.editedAt],
            ["apagada", (m: MessageReciveDataProps) => !!m.deletedAt],
            ["encaminhada", (m: MessageReciveDataProps) => !!m.forwarded],
            ["fixada", (m: MessageReciveDataProps) => !!m.pinned],
            ["com respostas", (m: MessageReciveDataProps) => (m.replyCount ?? 0) > 0],
            ["menção no texto", (m: MessageReciveDataProps) => !!m.content?.includes("@")],
            ["nota de voz", (m: MessageReciveDataProps) => m.contentType === "audio"],
            ["imagem", (m: MessageReciveDataProps) => m.contentType === "image"],
            ["vídeo", (m: MessageReciveDataProps) => m.contentType === "video"],
            ["documento", (m: MessageReciveDataProps) => m.contentType === "document"],
            ["texto longo", (m: MessageReciveDataProps) => (m.content?.length ?? 0) > 200],
            ["url sem espaço", (m: MessageReciveDataProps) => !!m.content?.startsWith("https://")],
            [
                "menção com índices calculados",
                (m: MessageReciveDataProps) => (m.mentions?.length ?? 0) > 0,
            ],
            [
                "duas menções na mesma mensagem",
                (m: MessageReciveDataProps) => (m.mentions?.length ?? 0) > 1,
            ],
            [
                "nota de voz sem waveform (traço de placeholder)",
                (m: MessageReciveDataProps) =>
                    m.contentType === "audio" && !m.media?.waveform?.length,
            ],
            [
                "nota de voz com reação",
                (m: MessageReciveDataProps) =>
                    m.contentType === "audio" && (m.reactions?.length ?? 0) > 0,
            ],
            [
                "mídia com legenda",
                (m: MessageReciveDataProps) => m.contentType === "image" && !!m.content,
            ],
            [
                "mídia sem legenda",
                (m: MessageReciveDataProps) => m.contentType === "video" && !m.content,
            ],
            ["mais de três reações", (m: MessageReciveDataProps) => (m.reactions?.length ?? 0) > 3],
            [
                "mensagem que é só um link",
                (m: MessageReciveDataProps) => !!m.content && /^https?:\/\/[^\s]+$/.test(m.content),
            ],
            [
                "link no meio da frase (que NÃO vira mensagem-link)",
                (m: MessageReciveDataProps) =>
                    !!m.content && m.content.includes("https://") && /\s/.test(m.content.trim()),
            ],
        ])("o mock cobre %s", (_label, predicate) => {
            expect(has(predicate)).toBe(true)
        })

        it.each(["pending", "sent", "delivered", "read", "failed"] as const)(
            "o mock cobre o status %s",
            (status) => {
                expect(allMessages().some((m) => m.status === status)).toBe(true)
            },
        )

        it("a nota de voz traz duração e waveform", () => {
            const audio = allMessages().find((m) => m.contentType === "audio")
            expect(audio?.media?.duration).toBeGreaterThan(0)
            expect(audio?.media?.waveform?.length).toBeGreaterThan(0)
        })
    })

    describe("linhas que não são mensagem", () => {
        it("há virada de dia e aviso do sistema", () => {
            const rows = CHATS.flatMap(rowsOf).filter(isDivider)
            expect(rows.some((row) => row.kind === "date")).toBe(true)
            expect(rows.some((row) => row.kind === "system")).toBe(true)
        })

        // O `resolveSequence` usa o divisor para interromper o bloco: duas mensagens do
        // mesmo autor separadas por "HOJE" são de dias diferentes.
        it("algum divisor cai no meio da conversa, não só no topo", () => {
            const rows = rowsOf("messaging:mock-1")
            const index = rows.findIndex((row) => isDivider(row) && row.kind === "date")
            expect(index).toBeGreaterThanOrEqual(0)
            expect(rows.slice(1).some(isDivider)).toBe(true)
        })
    })

    describe("lado da bolha e grupo", () => {
        // `isMine` é derivado no provider comparando o autor com a sessão. O mock precisa
        // carimbar o id de quem está logado, senão tudo cai como recebido.
        it("cada conversa tem mensagem minha e de outra pessoa", () => {
            for (const cid of CHATS) {
                const messages = messagesOf(cid)
                expect(
                    messages.some((m) => m.author.id === ME),
                    `só recebidas em ${cid}`,
                ).toBe(true)
                expect(
                    messages.some((m) => m.author.id !== ME),
                    `só minhas em ${cid}`,
                ).toBe(true)
            }
        })

        it("a conversa de grupo é marcada e tem três autores ou mais", () => {
            expect(isMockGroupChat("messaging:mock-3")).toBe(true)
            const authors = new Set(messagesOf("messaging:mock-3").map((m) => m.author.id))
            expect(authors.size).toBeGreaterThanOrEqual(3)
        })

        it("uma DM não é marcada como grupo", () => {
            expect(isMockGroupChat("messaging:mock-1")).toBe(false)
        })
    })

    /**
     * Combinações que só existem na vizinhança de outra mensagem. São as que quebram layout
     * sem ninguém perceber, porque cada mensagem isolada parece certa.
     */
    describe("combinações entre mensagens vizinhas", () => {
        const rows = () => rowsOf("messaging:mock-1")

        const pairs = () => {
            const list = rows()
            return list.slice(1).map((row, index) => [list[index], row] as const)
        }

        const someMessagePair = (
            predicate: (a: MessageReciveDataProps, b: MessageReciveDataProps) => boolean,
        ) => pairs().some(([a, b]) => !isDivider(a) && !isDivider(b) && predicate(a, b))

        it("há nota de voz seguida de texto do mesmo autor", () => {
            expect(
                someMessagePair(
                    (a, b) =>
                        a.contentType === "audio" &&
                        b.contentType === "text" &&
                        a.author.id === b.author.id,
                ),
            ).toBe(true)
        })

        it("há duas notas de voz seguidas", () => {
            expect(
                someMessagePair((a, b) => a.contentType === "audio" && b.contentType === "audio"),
            ).toBe(true)
        })

        it("há apagada no meio de um bloco do mesmo autor", () => {
            const list = rows()
            const found = list.some((row, index) => {
                const previous = list[index - 1]
                const next = list[index + 1]
                if (isDivider(row) || !row.deletedAt) return false
                if (!previous || isDivider(previous) || previous.author.id !== row.author.id)
                    return false
                return !!next && !isDivider(next) && next.author.id === row.author.id
            })
            expect(found).toBe(true)
        })

        it("há bloco de três mensagens do mesmo autor dos dois lados", () => {
            const list = rows().filter((row): row is MessageReciveDataProps => !isDivider(row))
            const runs = new Map<string, number>()
            let current = { author: "", size: 0 }
            for (const row of list) {
                current =
                    row.author.id === current.author
                        ? { author: current.author, size: current.size + 1 }
                        : { author: row.author.id, size: 1 }
                runs.set(current.author, Math.max(runs.get(current.author) ?? 0, current.size))
            }
            expect((runs.get(ME) ?? 0) >= 3).toBe(true)
            expect([...runs.entries()].some(([id, size]) => id !== ME && size >= 3)).toBe(true)
        })

        it("a conversa de referência é longa o bastante para exercitar a rolagem", () => {
            expect(rows().length).toBeGreaterThanOrEqual(40)
        })
    })
})
