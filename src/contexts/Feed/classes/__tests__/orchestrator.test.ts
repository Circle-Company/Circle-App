import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock todas as dependências primeiro
vi.mock("../fetcher", () => ({
    Fetcher: vi.fn().mockImplementation(() => ({
        fetchChunk: vi.fn().mockResolvedValue([]),
        fetchOlderChunks: vi.fn().mockResolvedValue([]),
    })),
}))

vi.mock("../debounceGate", () => ({
    DebounceGate: vi.fn().mockImplementation(() => ({
        canProceed: vi.fn().mockReturnValue(true),
        mark: vi.fn(),
    })),
}))

vi.mock("../chunkManager", () => ({
    ChunkManager: vi.fn().mockImplementation(() => ({
        apply: vi.fn().mockReturnValue({
            updatedList: [],
            removedItems: [],
        }),
    })),
}))

vi.mock("../cacheManager", () => ({
    CacheManager: vi.fn().mockImplementation(() => ({
        apply: vi.fn().mockResolvedValue(undefined),
        preload: vi.fn().mockResolvedValue("file://cached-video.mp4"),
        get: vi.fn().mockReturnValue("file://cached-video.mp4"),
        has: vi.fn().mockReturnValue(true),
    })),
}))

vi.mock("../../helpers/mapper", () => ({
    mapper: vi.fn().mockReturnValue([]),
}))

// Importar após os mocks
import { FeedOrchestrator } from "../orchestrator"

// Mock data para os testes
const mockMoments = [
    {
        id: 1,
        user: {
            id: 1,
            username: "user1",
            verifyed: false,
            profile_picture: { small_resolution: "", tiny_resolution: "" },
            isFollowing: false,
        },
        description: "Test moment 1",
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
]

const mockInteractions = [
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
            partialView: false,
            completeView: false,
        },
    },
]

describe("FeedOrchestrator", () => {
    let orchestrator: FeedOrchestrator

    beforeEach(() => {
        vi.clearAllMocks()
        orchestrator = new FeedOrchestrator()
    })

    describe("constructor", () => {
        it("deve criar instância sem erro", () => {
            expect(orchestrator).toBeDefined()
        })
    })

    describe("fetch", () => {
        it("deve executar fetch básico sem erro", async () => {
            const result = await orchestrator.fetch(0, mockInteractions, mockMoments)

            expect(result).toBeDefined()
            expect(result.newFeed).toBeDefined()
            expect(result.addedChunk).toBeDefined()
            expect(Array.isArray(result.newFeed)).toBe(true)
            expect(Array.isArray(result.addedChunk)).toBe(true)
        })

        it("deve lidar com period 0", async () => {
            const result = await orchestrator.fetch(0, [], [])

            expect(result).toBeDefined()
        })

        it("deve lidar com reload", async () => {
            const result = await orchestrator.fetch(1, mockInteractions, mockMoments, true)

            expect(result).toBeDefined()
        })
    })

    describe("remove", () => {
        it("deve executar remove sem erro", async () => {
            const result = await orchestrator.remove(1, mockMoments)

            expect(result).toBeDefined()
            expect(result.newFeed).toBeDefined()
            expect(result.addedChunk).toBeDefined()
        })
    })

    describe("preloadSingle", () => {
        it("deve executar preloadSingle e retornar resultado", async () => {
            const result = await orchestrator.preloadSingle(1, "https://example.com/video.mp4")

            expect(typeof result === "string" || result === null).toBe(true)
        })
    })

    describe("getCached", () => {
        it("deve executar getCached e retornar resultado", async () => {
            const result = await orchestrator.getCached(1)

            expect(typeof result === "string" || result === null).toBe(true)
        })
    })

    describe("isVideoCached", () => {
        it("deve executar isVideoCached e retornar boolean", () => {
            const result = orchestrator.isVideoCached(1)

            expect(typeof result).toBe("boolean")
        })
    })

    describe("preload", () => {
        it("deve executar preload sem erro", () => {
            const momentsWithVideos = mockMoments.map((m) => ({
                ...m,
                videoUrl: `https://example.com/video-${m.id}.mp4`,
            }))

            // Não deve lançar erro
            expect(() => {
                orchestrator.preload([1], momentsWithVideos as any)
            }).not.toThrow()
        })

        it("deve lidar com momentos sem videoUrl", () => {
            // Não deve lançar erro
            expect(() => {
                orchestrator.preload([1], mockMoments)
            }).not.toThrow()
        })
    })

    describe("cenários de integração", () => {
        it("deve executar fluxo completo sem erro", async () => {
            // Fetch inicial
            const fetchResult = await orchestrator.fetch(0, [], [])
            expect(fetchResult).toBeDefined()

            // Preload
            orchestrator.preload([1], mockMoments)

            // Get cached
            const cachedResult = await orchestrator.getCached(1)
            expect(typeof cachedResult === "string" || cachedResult === null).toBe(true)

            // Remove
            const removeResult = await orchestrator.remove(1, mockMoments)
            expect(removeResult).toBeDefined()
        })

        it("deve lidar com múltiplas operações sequenciais", async () => {
            await orchestrator.fetch(0, [], [])
            await orchestrator.fetch(1, mockInteractions, mockMoments)
            await orchestrator.remove(1, mockMoments)
            await orchestrator.preloadSingle(2, "https://example.com/video2.mp4")

            // Se chegou até aqui, todas as operações foram executadas sem erro
            expect(true).toBe(true)
        })
    })
})
