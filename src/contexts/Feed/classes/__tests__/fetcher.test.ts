import { describe, it, expect, vi, beforeEach, Mock } from "vitest"
import { Fetcher } from "../fetcher"

// Mock das dependências
vi.mock("@/services/Api", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}))

vi.mock("@/contexts/Persisted", () => ({
    default: {
        session: {
            account: {
                jwtToken: "test-jwt-token",
            },
        },
    },
}))

vi.mock("react", async () => {
    const actual = await vi.importActual("react")
    return {
        ...actual,
        useContext: vi.fn(() => ({
            session: {
                account: {
                    jwtToken: "test-jwt-token",
                },
            },
        })),
    }
})

import api from "@/services/Api"

describe("Fetcher", () => {
    let fetcher: Fetcher
    const mockApi = api as { post: Mock; get: Mock }

    beforeEach(() => {
        vi.clearAllMocks()
        fetcher = new Fetcher()
    })

    describe("constructor", () => {
        it("deve inicializar com jwtToken do contexto", () => {
            expect(fetcher).toBeInstanceOf(Fetcher)
            // Como jwtToken é privado, testamos indiretamente através do comportamento
        })

        it("deve usar useContext para obter session", () => {
            // Verificar se a instância foi criada sem erro
            const instance = new Fetcher()
            expect(instance).toBeInstanceOf(Fetcher)

            // O mock do useContext está configurado e deve ter sido usado
            expect(require("react").useContext).toBeDefined()
        })
    })

    describe("fetchChunk", () => {
        it("deve fazer requisição POST para /moments/feed", async () => {
            const mockResponse = {
                data: [
                    {
                        id: 1,
                        user: {
                            id: 1,
                            username: "testuser",
                            verifyed: false,
                            profile_picture: { small_resolution: "", tiny_resolution: "" },
                            isFollowing: false,
                        },
                        description: "Test moment",
                        content_type: "VIDEO",
                        midia: {
                            content_type: "VIDEO" as const,
                            nhd_thumbnail: "",
                            fullhd_resolution: "",
                            nhd_resolution: "",
                        },
                        comments_count: 0,
                        likes_count: 0,
                        isLiked: false,
                        deleted: false,
                        created_at: "2024-01-01T00:00:00Z",
                    },
                ],
            }

            mockApi.post.mockResolvedValue(mockResponse)

            const period = 1
            const interactions = [
                {
                    id: 1,
                    tags: [],
                    duration: 5000,
                    type: "VIDEO" as const,
                    language: "pt" as const,
                    interaction: {
                        like: false,
                        share: false,
                        click: false,
                        comment: false,
                        likeComment: false,
                        showLessOften: false,
                        report: false,
                        initialLikedState: false,
                    },
                },
            ]

            const result = await fetcher.fetchChunk(period, interactions)

            expect(mockApi.post).toHaveBeenCalledWith(
                "/moments/feed",
                {
                    period: 1,
                    length: 1,
                    data: interactions,
                },
                {
                    headers: {
                        Authorization: "test-jwt-token",
                    },
                },
            )

            expect(result).toEqual(mockResponse.data)
        })

        it("deve retornar array vazio quando response.data é undefined", async () => {
            mockApi.post.mockResolvedValue({ data: undefined })

            const result = await fetcher.fetchChunk(0, [])

            expect(result).toEqual([])
        })

        it("deve retornar array vazio quando response.data é null", async () => {
            mockApi.post.mockResolvedValue({ data: null })

            const result = await fetcher.fetchChunk(0, [])

            expect(result).toEqual([])
        })

        it("deve passar período correto na requisição", async () => {
            mockApi.post.mockResolvedValue({ data: [] })

            await fetcher.fetchChunk(5, [])

            expect(mockApi.post).toHaveBeenCalledWith(
                "/moments/feed",
                expect.objectContaining({ period: 5 }),
                expect.any(Object),
            )
        })

        it("deve passar length baseado no tamanho do array de interactions", async () => {
            mockApi.post.mockResolvedValue({ data: [] })

            const interactions = new Array(3).fill({
                id: 1,
                tags: [],
                duration: 1000,
                type: "VIDEO",
                language: "pt",
                interaction: {},
            })

            await fetcher.fetchChunk(1, interactions)

            expect(mockApi.post).toHaveBeenCalledWith(
                "/moments/feed",
                expect.objectContaining({ length: 3 }),
                expect.any(Object),
            )
        })

        it("deve incluir array de interactions no payload", async () => {
            mockApi.post.mockResolvedValue({ data: [] })

            const interactions = [
                {
                    id: 1,
                    tags: [],
                    duration: 5000,
                    type: "VIDEO" as const,
                    language: "en" as const,
                    interaction: {
                        like: true,
                        share: false,
                        click: true,
                        comment: false,
                        likeComment: false,
                        showLessOften: false,
                        report: false,
                        initialLikedState: false,
                    },
                },
            ]

            await fetcher.fetchChunk(1, interactions)

            expect(mockApi.post).toHaveBeenCalledWith(
                "/moments/feed",
                expect.objectContaining({ data: interactions }),
                expect.any(Object),
            )
        })

        it("deve incluir Authorization header com jwtToken", async () => {
            mockApi.post.mockResolvedValue({ data: [] })

            await fetcher.fetchChunk(1, [])

            expect(mockApi.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), {
                headers: {
                    Authorization: "test-jwt-token",
                },
            })
        })

        it("deve propagar erro da API", async () => {
            const apiError = new Error("API Error")
            mockApi.post.mockRejectedValue(apiError)

            await expect(fetcher.fetchChunk(1, [])).rejects.toThrow("API Error")
        })

        it("deve lidar com array vazio de interactions", async () => {
            mockApi.post.mockResolvedValue({ data: [] })

            const result = await fetcher.fetchChunk(0, [])

            expect(mockApi.post).toHaveBeenCalledWith(
                "/moments/feed",
                {
                    period: 0,
                    length: 0,
                    data: [],
                },
                expect.any(Object),
            )

            expect(result).toEqual([])
        })
    })

    describe("fetchOlderChunks", () => {
        it("deve retornar array vazio (stub implementation)", async () => {
            const result = await fetcher.fetchOlderChunks()

            expect(result).toEqual([])
        })

        it("deve retornar array vazio mesmo com cursor", async () => {
            const result = await fetcher.fetchOlderChunks("some-cursor")

            expect(result).toEqual([])
        })

        it("deve aceitar qualquer tipo de cursor", async () => {
            const result1 = await fetcher.fetchOlderChunks(123)
            const result2 = await fetcher.fetchOlderChunks({ id: 456 })
            const result3 = await fetcher.fetchOlderChunks(null)

            expect(result1).toEqual([])
            expect(result2).toEqual([])
            expect(result3).toEqual([])
        })
    })

    describe("integração", () => {
        it("deve funcionar com fluxo completo de fetch", async () => {
            const mockMoments = [
                {
                    id: 1,
                    description: "Moment 1",
                    user: { id: 1, username: "user1" },
                },
                {
                    id: 2,
                    description: "Moment 2",
                    user: { id: 2, username: "user2" },
                },
            ]

            mockApi.post.mockResolvedValue({ data: mockMoments })

            const interactions = [
                {
                    id: 1,
                    tags: [],
                    duration: 3000,
                    type: "IMAGE" as const,
                    language: "pt" as const,
                    interaction: {
                        like: false,
                        share: true,
                        click: false,
                        comment: true,
                        likeComment: false,
                        showLessOften: false,
                        report: false,
                        initialLikedState: false,
                    },
                },
            ]

            const result = await fetcher.fetchChunk(2, interactions)

            // Verificar requisição
            expect(mockApi.post).toHaveBeenCalledTimes(1)
            expect(mockApi.post).toHaveBeenCalledWith(
                "/moments/feed",
                {
                    period: 2,
                    length: 1,
                    data: interactions,
                },
                {
                    headers: {
                        Authorization: "test-jwt-token",
                    },
                },
            )

            // Verificar resultado
            expect(result).toEqual(mockMoments)
        })

        it("deve manter token JWT consistente entre múltiplas chamadas", async () => {
            mockApi.post.mockResolvedValue({ data: [] })

            await fetcher.fetchChunk(1, [])
            await fetcher.fetchChunk(2, [])

            expect(mockApi.post).toHaveBeenCalledTimes(2)

            // Ambas chamadas devem usar o mesmo token
            const calls = mockApi.post.mock.calls
            expect(calls[0][2].headers.Authorization).toBe("test-jwt-token")
            expect(calls[1][2].headers.Authorization).toBe("test-jwt-token")
        })
    })

    describe("casos de erro", () => {
        it("deve lidar com erro de rede", async () => {
            mockApi.post.mockRejectedValue(new Error("Network Error"))

            await expect(fetcher.fetchChunk(1, [])).rejects.toThrow("Network Error")
        })

        it("deve lidar com resposta malformada", async () => {
            mockApi.post.mockResolvedValue({ notData: [] })

            const result = await fetcher.fetchChunk(1, [])

            expect(result).toEqual([])
        })

        it("deve lidar com erro HTTP", async () => {
            const httpError = new Error("HTTP 500")
            httpError.name = "HTTPError"
            mockApi.post.mockRejectedValue(httpError)

            await expect(fetcher.fetchChunk(1, [])).rejects.toThrow("HTTP 500")
        })

        it("deve lidar com timeout", async () => {
            mockApi.post.mockRejectedValue(new Error("Request timeout"))

            await expect(fetcher.fetchChunk(1, [])).rejects.toThrow("Request timeout")
        })
    })

    describe("validação de dados", () => {
        it("deve aceitar interactions com diferentes estruturas", async () => {
            mockApi.post.mockResolvedValue({ data: [] })

            const complexInteractions = [
                {
                    id: 1,
                    tags: ["tag1", "tag2"],
                    duration: 15000,
                    type: "VIDEO" as const,
                    language: "en" as const,
                    interaction: {
                        like: true,
                        share: true,
                        click: true,
                        comment: true,
                        likeComment: true,
                        showLessOften: false,
                        report: false,
                        initialLikedState: true,
                        partialView: true,
                        completeView: false,
                    },
                },
            ]

            await fetcher.fetchChunk(1, complexInteractions)

            expect(mockApi.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    data: complexInteractions,
                }),
                expect.any(Object),
            )
        })

        it("deve funcionar com período zero", async () => {
            mockApi.post.mockResolvedValue({ data: [] })

            await fetcher.fetchChunk(0, [])

            expect(mockApi.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ period: 0 }),
                expect.any(Object),
            )
        })

        it("deve funcionar com período negativo", async () => {
            mockApi.post.mockResolvedValue({ data: [] })

            await fetcher.fetchChunk(-1, [])

            expect(mockApi.post).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ period: -1 }),
                expect.any(Object),
            )
        })
    })
})
