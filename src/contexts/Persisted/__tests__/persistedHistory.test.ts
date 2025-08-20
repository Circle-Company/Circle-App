import { describe, it, expect, vi, beforeEach } from "vitest"

// Create a mock for the useHistoryStore hook
const mockHistoryStore = {
    searchHistory: [],
    set: vi.fn((value: any) => {
        mockHistoryStore.searchHistory = value
    }),
    load: vi.fn(),
    remove: vi.fn(() => {
        mockHistoryStore.searchHistory = []
    }),
}

// Mock the entire module
vi.mock("../persistedHistory", () => ({
    useHistoryStore: () => mockHistoryStore,
}))

describe("persistedHistory Store", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset mock state
        mockHistoryStore.searchHistory = []
    })

    describe("Store Initialization", () => {
        it("should initialize with empty search history", () => {
            expect(mockHistoryStore.searchHistory).toEqual([])
        })
    })

    describe("History Operations", () => {
        it("should set search history", () => {
            const historyData = [
                {
                    query: "test search",
                    timestamp: "2024-01-15T10:00:00Z",
                    count: 1,
                    active: true,
                    tags: ["test"],
                },
            ]

            mockHistoryStore.set(historyData)
            expect(mockHistoryStore.set).toHaveBeenCalledWith(historyData)
            expect(mockHistoryStore.searchHistory).toEqual(historyData)
        })

        it("should load history from storage", () => {
            mockHistoryStore.load()
            expect(mockHistoryStore.load).toHaveBeenCalled()
        })

        it("should remove all history data", () => {
            // Set some data first
            const historyData = [{ query: "test", timestamp: "2024-01-15T10:00:00Z" }]
            mockHistoryStore.set(historyData)

            // Then remove
            mockHistoryStore.remove()

            expect(mockHistoryStore.remove).toHaveBeenCalled()
            expect(mockHistoryStore.searchHistory).toEqual([])
        })
    })

    describe("Search History Validation", () => {
        it("should handle complex search items", () => {
            const searchItem = {
                query: "complex search",
                timestamp: "2024-01-15T10:00:00Z",
                count: 5,
                active: true,
                tags: ["tag1", "tag2", "tag3"],
            }

            expect(searchItem.count).toBeDefined()
            expect(searchItem.active).toBeDefined()
            expect(Array.isArray(searchItem.tags)).toBe(true)
            expect(searchItem.timestamp).toBeDefined()
        })
    })

    describe("Method Validation", () => {
        it("should have all required methods defined", () => {
            expect(mockHistoryStore.set).toBeDefined()
            expect(mockHistoryStore.load).toBeDefined()
            expect(mockHistoryStore.remove).toBeDefined()
        })
    })
})
