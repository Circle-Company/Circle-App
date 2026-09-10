import { describe, expect, it } from "vitest"

import { MOCK_CONVERSATIONS, mockMessages } from "../chat.mock"

const ME = "user-logado"

/**
 * Guarda-corpo do mock da conversa.
 *
 * O que motivou este arquivo: a tela buscava as mensagens por `cid`, e o `cid` chegava
 * percent-encodado da navegação (`messaging%3Amock-1`). A busca não achava nada, a lista vinha
 * vazia, e na tela isso parecia bug de layout — bolha sem texto e sem horário. Falha silenciosa
 * de lookup por chave é exatamente o tipo de coisa que um teste barato pega e o olho não.
 */
describe("mockMessages", () => {
    it("devolve mensagens para as conversas que declaram ter", () => {
        for (const cid of ["messaging:mock-1", "messaging:mock-2", "messaging:mock-7"]) {
            expect(mockMessages(cid, ME).length, `sem mensagens para ${cid}`).toBeGreaterThan(0)
        }
    })

    it("cid desconhecido devolve lista vazia em vez de quebrar", () => {
        expect(mockMessages("messaging:não-existe", ME)).toEqual([])
    })

    // O sintoma original: chave codificada não bate, e a conversa aparece vazia.
    it("cid percent-encodado não encontra nada — a tela precisa decodificar antes", () => {
        expect(mockMessages("messaging%3Amock-1", ME)).toEqual([])
    })

    it("toda conversa do grid com balão tem cid no formato do Stream", () => {
        for (const preview of MOCK_CONVERSATIONS) {
            expect(preview.cid).toMatch(/^messaging:/)
        }
    })

    describe("forma dos dados que o componente consome", () => {
        const all = ["messaging:mock-1", "messaging:mock-2", "messaging:mock-7"].flatMap((cid) =>
            mockMessages(cid, ME),
        )

        it("todas trazem os campos obrigatórios preenchidos", () => {
            for (const message of all) {
                expect(message.id, "id").toBeTruthy()
                expect(message.chatId, `chatId de ${message.id}`).toBeTruthy()
                expect(message.author?.id, `author.id de ${message.id}`).toBeTruthy()
                expect(message.status, `status de ${message.id}`).toBeTruthy()
                // `createdAt` alimenta a hora no rodapé: sem data legível o rótulo some.
                expect(
                    Number.isFinite(Date.parse(message.createdAt)),
                    `createdAt de ${message.id} não é data`,
                ).toBe(true)
            }
        })

        it("mensagem de texto sempre tem conteúdo — senão a bolha sai vazia", () => {
            const texts = all.filter((m) => m.contentType === "text" && !m.deletedAt)
            expect(texts.length).toBeGreaterThan(0)
            for (const message of texts) {
                expect(message.content, `content de ${message.id}`).toBeTruthy()
            }
        })

        it("nota de voz traz url, duração e waveform", () => {
            const audio = all.find((m) => m.contentType === "audio")
            expect(audio, "nenhuma nota de voz no mock").toBeDefined()
            expect(audio?.media?.url).toBeTruthy()
            expect(audio?.media?.duration).toBeGreaterThan(0)
            expect(audio?.media?.waveform?.length).toBeGreaterThan(0)
        })
    })

    describe("lado da bolha", () => {
        // `isMine` é derivado no provider comparando o autor com a sessão. O mock precisa
        // carimbar o id de quem está logado, senão tudo cai como recebido.
        it("carimba o id recebido nas mensagens próprias", () => {
            const messages = mockMessages("messaging:mock-1", ME)
            expect(messages.some((m) => m.author.id === ME)).toBe(true)
        })

        it("também traz mensagens de outra pessoa, para haver os dois lados", () => {
            const messages = mockMessages("messaging:mock-1", ME)
            expect(messages.some((m) => m.author.id !== ME)).toBe(true)
        })
    })
})
