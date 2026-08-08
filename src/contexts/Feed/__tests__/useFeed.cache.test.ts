import { act, renderHook } from "@testing-library/react-hooks"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { MomentProps } from "@/contexts/Feed/types"
import { useFeed } from "@/contexts/Feed/useFeed"

// `src/test-setup.ts` troca `@/contexts/Persisted` por um objeto simples, que
// não é um contexto React — `useContext` devolveria undefined e `useFeed`
// quebraria ao desestruturar `session`. Este mock local devolve um contexto de
// verdade, cujo valor padrão já serve de sessão (dispensa Provider/wrapper).
vi.mock("@/contexts/Persisted", async () => {
    const react = await vi.importActual<typeof import("react")>("react")
    return {
        default: react.createContext({
            session: {
                user: { id: "user-1" },
                account: { jwtToken: "token-123" },
                preferences: {},
                statistics: {},
            },
        }),
    }
})

const fetchMock = vi.fn()
const removeMock = vi.fn()
const getCachedMock = vi.fn()
const preloadSingleMock = vi.fn()
const resolveVideoMock = vi.fn()
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
        resolveVideo: resolveVideoMock,
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

// Sem wrapper de PersistedContext: o valor padrão do contexto mockado acima já
// serve de sessão. O JSX do wrapper antigo também impedia a coleta do arquivo
// (é um `.ts`), motivo pelo qual estes testes nunca chegaram a rodar.

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

    it("retorna URL do cache quando disponível", async () => {
        const moment = createMoment({ id: "moment-1" })
        fetchMock.mockResolvedValue({ newFeed: [moment], addedChunk: [moment.id] })
        resolveVideoMock.mockResolvedValue("app-cache://moment-1")

        const { result } = renderHook(() => useFeed())

        await act(async () => {
            await result.current.fetch()
        })

        let cachedUrl: string | null = null
        await act(async () => {
            cachedUrl = await result.current.loadVideoFromCache(moment.id)
        })

        expect(cachedUrl).toBe("app-cache://moment-1")
        expect(resolveVideoMock).toHaveBeenCalledWith(moment.id, moment.media)
    })

    it("resolve pela URL informada quando o momento não está no feed", async () => {
        // Caso das telas fora do feed (perfil, conta, tela cheia): o momento
        // não existe em `feedData`, e antes disso a resolução devolvia null e
        // o vídeo era rebaixado para download novo.
        fetchMock.mockResolvedValue({ newFeed: [], addedChunk: [] })
        resolveVideoMock.mockResolvedValue("app-cache://moment-externo")

        const { result } = renderHook(() => useFeed())

        let url: string | null = null
        await act(async () => {
            url = await result.current.loadVideoFromCache(
                "moment-externo",
                "https://video-externo.mp4",
            )
        })

        expect(url).toBe("app-cache://moment-externo")
        expect(resolveVideoMock).toHaveBeenCalledWith(
            "moment-externo",
            "https://video-externo.mp4",
        )
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

        const { result } = renderHook(() => useFeed())

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

        const { result } = renderHook(() => useFeed())

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
