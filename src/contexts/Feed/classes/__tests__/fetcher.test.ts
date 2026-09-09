import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Fetcher } from "../fetcher"

const mockApiGet = vi.hoisted(() => vi.fn())

vi.mock("@/api", () => ({
    default: {
        get: mockApiGet,
    },
}))

const moment = {
    id: "123",
    user: {
        id: "u1",
        username: "tester",
        profilePicture: "http://example.com/avatar.jpg",
    },
    media: "http://example.com/video.mp4",
    thumbnail: "http://example.com/thumb.jpg",
    duration: 10,
    size: "1000",
    hasAudio: true,
    ageRestriction: false,
    contentWarning: false,
    metrics: { totalViews: 1, totalLikes: 2, totalComments: 3 },
    publishedAt: "2024-01-01T00:00:00Z",
}

const okResponse = { data: { success: true, total: 1, moments: [moment] } }

/** Erro no formato que o axios entrega quando o servidor respondeu. */
const httpError = (status: number) =>
    Object.assign(new Error(`HTTP ${status}`), {
        response: { status },
    })

describe("Fetcher", () => {
    let fetcher: Fetcher

    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        fetcher = new Fetcher()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    /** Avança o relógio até a promessa assentar, para não esperar o backoff em tempo real. */
    async function settle<T>(promise: Promise<T>): Promise<T> {
        const drained = promise.then(
            (v) => ({ v }),
            (e) => {
                throw e
            },
        )
        await vi.runAllTimersAsync()
        return (await drained).v
    }

    it("chama /feed sem montar header — quem autentica é o interceptor", async () => {
        mockApiGet.mockResolvedValue(okResponse)

        const outcome = await settle(fetcher.fetchChunk())

        // O Fetcher guardava o JWT capturado na construção e o mandava a cada chunk. Como
        // o feed vive a sessão inteira, esse token envelhecia: depois da primeira rotação
        // todo request de feed saía com a credencial antiga — e o header preenchido vencia
        // o que o interceptor injetaria.
        expect(mockApiGet).toHaveBeenCalledWith("/feed", { signal: expect.anything() })

        // O Fetcher repassa os moments como vieram: a normalização para o formato de
        // componente é feita camadas acima, não aqui.
        expect(outcome).toEqual({ ok: true, moments: [moment] })
    })

    it("descarta itens sem id em vez de deixá-los envenenar o chunk", async () => {
        mockApiGet.mockResolvedValue({
            data: { success: true, total: 3, moments: [moment, { id: "" }, null, { foo: 1 }] },
        })

        const outcome = await settle(fetcher.fetchChunk())

        expect(outcome).toEqual({ ok: true, moments: [moment] })
    })

    it("classifica corpo inválido como malformed — e não retenta", async () => {
        mockApiGet.mockResolvedValue({ data: { success: false } })

        const outcome = await settle(fetcher.fetchChunk())

        expect(outcome).toEqual({ ok: false, reason: "malformed" })
        expect(mockApiGet).toHaveBeenCalledTimes(1)
    })

    it("distingue falha de feed vazio", async () => {
        mockApiGet.mockRejectedValue(new Error("Network error"))

        const outcome = await settle(fetcher.fetchChunk())

        // Este é o ponto do redesenho: antes isto devolvia `[]`, indistinguível de um
        // feed legitimamente vazio — e num reload o orquestrador apagava a lista.
        expect(outcome).toEqual({ ok: false, reason: "offline" })
    })

    it("retenta falha de rede até o limite", async () => {
        mockApiGet.mockRejectedValue(new Error("Network error"))

        const outcome = await settle(fetcher.fetchChunk())

        expect(outcome).toEqual({ ok: false, reason: "offline" })
        expect(mockApiGet).toHaveBeenCalledTimes(3)
    })

    it("desiste na primeira tentativa em 4xx", async () => {
        mockApiGet.mockRejectedValue(httpError(403))

        const outcome = await settle(fetcher.fetchChunk())

        // 401/403 são determinísticos daqui: quem resolve credencial é o interceptor.
        // Insistir só gastaria o orçamento de auth da request.
        expect(outcome).toEqual({ ok: false, reason: "client", status: 403 })
        expect(mockApiGet).toHaveBeenCalledTimes(1)
    })

    it("retenta 5xx e 429", async () => {
        mockApiGet.mockRejectedValueOnce(httpError(503)).mockResolvedValueOnce(okResponse)

        const outcome = await settle(fetcher.fetchChunk())

        expect(outcome).toEqual({ ok: true, moments: [moment] })
        expect(mockApiGet).toHaveBeenCalledTimes(2)
    })

    it("recupera após uma falha transitória", async () => {
        mockApiGet
            .mockRejectedValueOnce(new Error("Network error"))
            .mockResolvedValueOnce(okResponse)

        const outcome = await settle(fetcher.fetchChunk())

        expect(outcome).toEqual({ ok: true, moments: [moment] })
        expect(mockApiGet).toHaveBeenCalledTimes(2)
    })

    it("compartilha o request em voo entre chamadas simultâneas", async () => {
        mockApiGet.mockResolvedValue(okResponse)

        const first = fetcher.fetchChunk()
        const second = fetcher.fetchChunk()

        const [a, b] = await settle(Promise.all([first, second]))

        expect(a).toBe(b)
        expect(mockApiGet).toHaveBeenCalledTimes(1)
    })

    it("libera o single-flight depois de assentar", async () => {
        mockApiGet.mockResolvedValue(okResponse)

        await settle(fetcher.fetchChunk())
        await settle(fetcher.fetchChunk())

        expect(mockApiGet).toHaveBeenCalledTimes(2)
    })

    it("aborta o request em voo e não retenta", async () => {
        mockApiGet.mockImplementation(
            (_url: string, { signal }: any = {}) =>
                new Promise((_resolve, reject) => {
                    signal?.addEventListener("abort", () => reject(new Error("canceled")))
                }),
        )

        const promise = fetcher.fetchChunk()
        fetcher.abort()

        const outcome = await settle(promise)

        expect(outcome).toEqual({ ok: false, reason: "aborted" })
        expect(mockApiGet).toHaveBeenCalledTimes(1)
    })

    it("aborta por timeout e classifica como timeout", async () => {
        mockApiGet.mockImplementation(
            (_url: string, { signal }: any = {}) =>
                new Promise((_resolve, reject) => {
                    signal?.addEventListener("abort", () => reject(new Error("canceled")))
                }),
        )

        const outcome = await settle(fetcher.fetchChunk())

        // Timeout é retriável: as três tentativas estouram antes de desistir.
        expect(outcome).toEqual({ ok: false, reason: "timeout" })
        expect(mockApiGet).toHaveBeenCalledTimes(3)
    })
})
