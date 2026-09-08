import { beforeEach, describe, expect, it, vi } from "vitest"

// Importar após os mocks
import { CacheManager } from "../cacheManager"

// O CacheManager usa `expo-file-system/legacy` (o mock antigo era de
// `react-native-fs`, que o código não usa mais — por isso o módulo real era
// carregado e explodia em `expo-modules-core` sem o runtime nativo).
vi.mock("expo-file-system/legacy", () => ({
    cacheDirectory: "file:///mock/cache/",
    getInfoAsync: vi.fn().mockResolvedValue({ exists: true, size: 1024 }),
    makeDirectoryAsync: vi.fn().mockResolvedValue(undefined),
    readDirectoryAsync: vi.fn().mockResolvedValue([]),
    deleteAsync: vi.fn().mockResolvedValue(undefined),
    downloadAsync: vi.fn().mockResolvedValue({ uri: "file:///mock/cache/videos/1.mp4" }),
}))

describe("CacheManager", () => {
    let cacheManager: CacheManager

    beforeEach(async () => {
        vi.clearAllMocks()
        cacheManager = new CacheManager(50)

        // Aguardar inicialização
        await new Promise((resolve) => setTimeout(resolve, 10))
    })

    describe("funcionalidade básica", () => {
        it("deve criar instância sem erro", () => {
            expect(cacheManager).toBeDefined()
        })

        it("deve retornar false para item não em cache", () => {
            expect(cacheManager.has("999")).toBe(false)
        })

        it("deve retornar undefined para get de item não em cache", () => {
            const result = cacheManager.get("999")
            expect(result).toBeUndefined()
        })

        it("deve conseguir fazer preload de um vídeo", async () => {
            const result = await cacheManager.preload({
                id: "1",
                url: "https://example.com/video.mp4",
            })

            expect(typeof result).toBe("string")
            expect(cacheManager.has("1")).toBe(true)
        })

        it("deve conseguir remover item do cache", async () => {
            await cacheManager.preload({ id: "1", url: "https://example.com/video.mp4" })
            await cacheManager.remove("1")

            expect(cacheManager.has("1")).toBe(false)
        })

        it("deve conseguir limpar todo o cache", async () => {
            await cacheManager.preload({ id: "1", url: "https://example.com/video1.mp4" })
            await cacheManager.preload({ id: "2", url: "https://example.com/video2.mp4" })

            cacheManager.clear()

            expect(cacheManager.has("1")).toBe(false)
            expect(cacheManager.has("2")).toBe(false)
        })
    })

    describe("comando apply", () => {
        it("deve executar comando CLEAR sem erro", async () => {
            await cacheManager.preload({ id: "1", url: "https://example.com/video.mp4" })

            await expect(cacheManager.apply("CLEAR")).resolves.not.toThrow()
            expect(cacheManager.has("1")).toBe(false)
        })

        it("deve executar comando REMOVE com número", async () => {
            await cacheManager.preload({ id: "1", url: "https://example.com/video.mp4" })

            await expect(cacheManager.apply("REMOVE", "1")).resolves.not.toThrow()
            expect(cacheManager.has("1")).toBe(false)
        })

        it("deve executar comando REMOVE com array", async () => {
            await cacheManager.preload({ id: "1", url: "https://example.com/video1.mp4" })
            await cacheManager.preload({ id: "2", url: "https://example.com/video2.mp4" })

            await expect(cacheManager.apply("REMOVE", ["1", "2"])).resolves.not.toThrow()
            expect(cacheManager.has("1")).toBe(false)
            expect(cacheManager.has("2")).toBe(false)
        })
    })

    describe("cenários de integração", () => {
        it("deve simular fluxo de preload e acesso", async () => {
            // Preload
            const preloadResult = await cacheManager.preload({
                id: "1",
                url: "https://example.com/video.mp4",
            })

            expect(preloadResult).toBeDefined()
            expect(cacheManager.has("1")).toBe(true)

            // Get
            const getResult = cacheManager.get("1")
            expect(getResult).toBeDefined()

            // Remove
            await cacheManager.remove("1")
            expect(cacheManager.has("1")).toBe(false)
        })

        it("deve lidar com múltiplos preloads do mesmo item", async () => {
            const promises = [
                cacheManager.preload({ id: "1", url: "https://example.com/video.mp4" }),
                cacheManager.preload({ id: "1", url: "https://example.com/video.mp4" }),
                cacheManager.preload({ id: "1", url: "https://example.com/video.mp4" }),
            ]

            const results = await Promise.all(promises)

            // Todos devem retornar resultado válido
            results.forEach((result) => {
                expect(typeof result).toBe("string")
            })

            expect(cacheManager.has("1")).toBe(true)
        })
    })
})
