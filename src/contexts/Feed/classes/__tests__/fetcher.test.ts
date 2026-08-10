import { beforeEach, describe, expect, it, vi } from "vitest"

import { Fetcher } from "../fetcher"
import api from "@/api"
import config from "@/config"

const mockApiGet = vi.hoisted(() => vi.fn())

vi.mock("@/api", () => ({
    default: {
        get: mockApiGet,
    },
}))

describe("Fetcher", () => {
    let fetcher: Fetcher

    beforeEach(() => {
        vi.clearAllMocks()
        fetcher = new Fetcher("test-jwt-token")
    })

    it("deve chamar endpoint /feed com header Authorization Bearer", async () => {
        mockApiGet.mockResolvedValue({
            data: {
                success: true,
                total: 1,
                moments: [
                    {
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
                        metrics: {
                            totalViews: 1,
                            totalLikes: 2,
                            totalComments: 3,
                        },
                        publishedAt: "2024-01-01T00:00:00Z",
                    },
                ],
            },
        })

        const result = await fetcher.fetchChunk()

        expect(mockApiGet).toHaveBeenCalledWith("/feed", {
            headers: { Authorization: "Bearer test-jwt-token" },
        })

        // O Fetcher repassa os moments como vieram: a normalização para o
        // formato de componente é feita camadas acima, não aqui.
        expect(result).toEqual([
            {
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
                metrics: {
                    totalViews: 1,
                    totalLikes: 2,
                    totalComments: 3,
                },
                publishedAt: "2024-01-01T00:00:00Z",
            },
        ])
    })

    it("deve reescrever hosts de desenvolvimento legados para o ENDPOINT atual", async () => {
        mockApiGet.mockResolvedValue({
            data: {
                success: true,
                total: 1,
                moments: [
                    {
                        id: "123",
                        media: "http://172.31.80.1:3000/video.mp4",
                        thumbnail: "http://10.15.0.235:3000/thumb.jpg",
                    },
                ],
            },
        })

        const [moment] = await fetcher.fetchChunk()

        expect(moment.media).toBe(`${config.ENDPOINT}/video.mp4`)
        expect(moment.thumbnail).toBe(`${config.ENDPOINT}/thumb.jpg`)
    })

    it("deve retornar array vazio em resposta inválida", async () => {
        mockApiGet.mockResolvedValue({ data: { success: false } })

        const result = await fetcher.fetchChunk()

        expect(result).toEqual([])
    })

    it("deve capturar erros da API e retornar array vazio", async () => {
        mockApiGet.mockRejectedValue(new Error("Network error"))

        const result = await fetcher.fetchChunk()

        expect(result).toEqual([])
    })
})
