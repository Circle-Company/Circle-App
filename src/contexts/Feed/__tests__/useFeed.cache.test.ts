import { act, renderHook } from "@testing-library/react-hooks"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { MomentProps } from "@/contexts/Feed/types"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import { useFeed } from "@/contexts/Feed/useFeed"

const fetchMock = vi.fn()
const removeMock = vi.fn()
const getCachedMock = vi.fn()
const preloadSingleMock = vi.fn()
const preloadMock = vi.fn()

const markVideoAsViewedMock = vi.fn()
const cleanupViewedVideosMock = vi.fn()
const preloadUpcomingVideosMock = vi.fn()

vi.mock("@/contexts/Feed/classes/orchestrator", () => ({
    FeedOrchestrator: vi.fn().mockImplementation(() => ({
        fetch: fetchMock,
        remove: removeMock,
        getCached: getCachedMock,
        preloadSingle: preloadSingleMock,
        preload: preloadMock,
        markVideoAsViewed: markVideoAsViewedMock,
        cleanupViewedVideos: cleanupViewedVideosMock,
        preloadUpcomingVideos: preloadUpcomingVideosMock,
    })),
}))

vi.mock("@/lib/hooks/useTimer", () => ({
    useTimer: vi.fn(() => [vi.fn()]),
}))

vi.mock("@/contexts/Feed/helpers/calculeCacheMaxSize", () => ({
    useCalculeCacheMaxSize: vi.fn(() => 50),
}))

const sessionContextValue = {
    session: {
        user: { id: "user-1" },
        account: { jwtToken: "token-123" },
        preferences: {} as unknown,
        statistics: {} as unknown,
    },
    device: {
        permissions: {} as unknown,
        metadata: {
            deviceId: "device-1",
            screenWidth: 1080,
            screenHeight: 1920,
            isTablet: false,
            pixelDensity: 2,
            fontScale: 1,
            totalMemory: 4 * 1024 * 1024 * 1024,
            availableMemory: 2 * 1024 * 1024 * 1024,
        },
    },
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PersistedContext.Provider value={sessionContextValue as any}>
        {children}
    </PersistedContext.Provider>
)

const createMoment = (overrides: Partial<MomentProps> = {}): MomentProps => ({
    id: "moment-1",
    user: {
        id: "user-1",
        username: "tester",
        verified: false,
        profilePicture: "",
        isFollowing: false,
    },
    description: "",
    content_type: "VIDEO",
    midia: {
        content_type: "VIDEO",
        nhd_thumbnail: "thumb",
        fullhd_resolution: "https://video-full.mp4",
        nhd_resolution: "https://video-nhd.mp4",
    },
    comments_count: 0,
    likes_count: 0,
    isLiked: false,
    deleted: false,
    created_at: new Date().toISOString(),
    media: "https://video-stream.mp4",
    thumbnail: "https://thumb.jpg",
    duration: 10,
    size: "720p",
    hasAudio: true,
    ageRestriction: false,
    contentWarning: false,
    metrics: {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
    },
    publishedAt: new Date().toISOString(),
    ...overrides,
})

describe("useFeed cache integration", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        markVideoAsViewedMock.mockResolvedValue(undefined)
        cleanupViewedVideosMock.mockResolvedValue(undefined)
        preloadUpcomingVideosMock.mockResolvedValue(undefined)
    })

    it("retorna URL do cache quando disponível e marca como visualizado", async () => {
        const moment = createMoment({ id: "moment-1" })
        fetchMock.mockResolvedValue({ newFeed: [moment], addedChunk: [moment.id] })
        getCachedMock.mockResolvedValue("app-cache://moment-1")

        const { result } = renderHook(() => useFeed(), { wrapper })

        await act(async () => {
            await result.current.fetch()
        })

        let cachedUrl: string | null = null
        await act(async () => {
            cachedUrl = await result.current.loadVideoFromCache(moment.id)
        })

        expect(cachedUrl).toBe("app-cache://moment-1")
        expect(getCachedMock).toHaveBeenCalledWith(moment.id)
        // Preload não deve ser chamado quando já está em cache
        expect(preloadSingleMock).not.toHaveBeenCalled()
    })

    it("realiza preload quando vídeo não está no cache e retorna URL original", async () => {
        const moment = createMoment({ id: "moment-2" })
        fetchMock.mockResolvedValue({ newFeed: [moment], addedChunk: [moment.id] })
        getCachedMock.mockResolvedValueOnce(null)
        preloadSingleMock.mockResolvedValue("app-cache://moment-2")

        const { result } = renderHook(() => useFeed(), { wrapper })

        await act(async () => {
            await result.current.fetch()
        })

        let url: string | null = null
        await act(async () => {
            url = await result.current.loadVideoFromCache(moment.id)
        })

        expect(url).toBe(moment.media)
        expect(preloadSingleMock).toHaveBeenCalledWith(moment.id, moment.media)
    })

    it("faz preload dos próximos vídeos quando não estão em cache", async () => {
        const firstMoment = createMoment({ id: "moment-3" })
        const secondMoment = createMoment({
            id: "moment-4",
            media: "https://video-second.mp4",
            midia: {
                content_type: "VIDEO",
                nhd_thumbnail: "thumb",
                fullhd_resolution: "https://video-second-full.mp4",
                nhd_resolution: "https://video-second-nhd.mp4",
            },
        })
        const thirdMoment = createMoment({
            id: "moment-5",
            media: "https://video-third.mp4",
            midia: {
                content_type: "VIDEO",
                nhd_thumbnail: "thumb",
                fullhd_resolution: "https://video-third-full.mp4",
                nhd_resolution: "https://video-third-nhd.mp4",
            },
        })

        fetchMock.mockResolvedValue({
            newFeed: [firstMoment, secondMoment, thirdMoment],
            addedChunk: ["moment-3", "moment-4", "moment-5"],
        })
        getCachedMock.mockResolvedValue(null)

        const { result } = renderHook(() => useFeed(), { wrapper })

        await act(async () => {
            await result.current.fetch()
        })

        await act(async () => {
            await result.current.preloadNextVideo(0)
        })

        // Deve verificar cache e fazer preload dos próximos 3 vídeos
        expect(getCachedMock).toHaveBeenCalled()
        expect(preloadSingleMock).toHaveBeenCalled()
    })

    it("não tenta preload quando índice é o último item", async () => {
        const firstMoment = createMoment({ id: "moment-5" })
        const secondMoment = createMoment({ id: "moment-6" })

        fetchMock.mockResolvedValue({
            newFeed: [firstMoment, secondMoment],
            addedChunk: ["moment-5", "moment-6"],
        })
        getCachedMock.mockResolvedValue(null)

        const { result } = renderHook(() => useFeed(), { wrapper })

        await act(async () => {
            await result.current.fetch()
        })

        preloadSingleMock.mockClear()
        await act(async () => {
            await result.current.preloadNextVideo(1)
        })

        expect(preloadSingleMock).not.toHaveBeenCalled()
    })
})
