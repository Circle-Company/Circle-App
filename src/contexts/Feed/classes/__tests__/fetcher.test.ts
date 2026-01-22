import { beforeEach, describe, expect, it, vi } from "vitest"

import { Fetcher } from "../fetcher"
import api from "@/api"

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

        expect(result).toEqual([
            {
                id: "123",
                user: {
                    id: "u1",
                    username: "tester",
                    verified: false,
                    profilePicture: "http://example.com/avatar.jpg",
                    isFollowing: false,
                },
                description: "",
                content_type: "VIDEO",
                midia: {
                    content_type: "VIDEO",
                    nhd_thumbnail: "http://example.com/thumb.jpg",
                    fullhd_resolution: "http://example.com/video.mp4",
                    nhd_resolution: "http://example.com/video.mp4",
                },
                comments_count: 3,
                likes_count: 2,
                isLiked: false,
                deleted: false,
                created_at: "2024-01-01T00:00:00Z",
                lastComment: undefined,
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
