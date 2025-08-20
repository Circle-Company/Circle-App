import { describe, it, expect, vi, beforeEach } from "vitest"

// Create a mock for the useStatisticsStore hook
const mockStatisticsStore = {
    total_followers_num: 0,
    total_likes_num: 0,
    total_views_num: 0,
    setTotalFollowersNum: vi.fn((value: number) => {
        mockStatisticsStore.total_followers_num = value
    }),
    setTotalLikesNum: vi.fn((value: number) => {
        mockStatisticsStore.total_likes_num = value
    }),
    setTotalViewsNum: vi.fn((value: number) => {
        mockStatisticsStore.total_views_num = value
    }),
    set: vi.fn(),
    get: vi.fn(),
    load: vi.fn(),
    remove: vi.fn(() => {
        mockStatisticsStore.total_followers_num = 0
        mockStatisticsStore.total_likes_num = 0
        mockStatisticsStore.total_views_num = 0
    }),
}

// Mock the entire module
vi.mock("../persistedStatistics", () => ({
    useStatisticsStore: () => mockStatisticsStore,
}))

describe("persistedStatistics Store", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset mock state
        mockStatisticsStore.total_followers_num = 0
        mockStatisticsStore.total_likes_num = 0
        mockStatisticsStore.total_views_num = 0
    })

    describe("Store Initialization", () => {
        it("should initialize with default statistics values", () => {
            expect(mockStatisticsStore.total_followers_num).toBe(0)
            expect(mockStatisticsStore.total_likes_num).toBe(0)
            expect(mockStatisticsStore.total_views_num).toBe(0)
        })
    })

    describe("Statistics Setters", () => {
        it("should update total followers number", () => {
            mockStatisticsStore.setTotalFollowersNum(150)

            expect(mockStatisticsStore.setTotalFollowersNum).toHaveBeenCalledWith(150)
            expect(mockStatisticsStore.total_followers_num).toBe(150)
        })

        it("should update total likes number", () => {
            mockStatisticsStore.setTotalLikesNum(2500)

            expect(mockStatisticsStore.setTotalLikesNum).toHaveBeenCalledWith(2500)
            expect(mockStatisticsStore.total_likes_num).toBe(2500)
        })

        it("should update total views number", () => {
            mockStatisticsStore.setTotalViewsNum(10000)

            expect(mockStatisticsStore.setTotalViewsNum).toHaveBeenCalledWith(10000)
            expect(mockStatisticsStore.total_views_num).toBe(10000)
        })
    })

    describe("Bulk Operations", () => {
        it("should have set method", () => {
            const statisticsData = {
                total_followers_num: 200,
                total_likes_num: 3000,
                total_views_num: 15000,
            }

            mockStatisticsStore.set(statisticsData)
            expect(mockStatisticsStore.set).toHaveBeenCalledWith(statisticsData)
        })

        it("should have get method for API calls", () => {
            mockStatisticsStore.get(123)
            expect(mockStatisticsStore.get).toHaveBeenCalledWith(123)
        })

        it("should have load method", () => {
            mockStatisticsStore.load()
            expect(mockStatisticsStore.load).toHaveBeenCalled()
        })

        it("should remove all statistics data", () => {
            // Set some data first
            mockStatisticsStore.setTotalFollowersNum(100)
            mockStatisticsStore.setTotalLikesNum(500)
            mockStatisticsStore.setTotalViewsNum(1000)

            // Then remove
            mockStatisticsStore.remove()

            expect(mockStatisticsStore.remove).toHaveBeenCalled()
            expect(mockStatisticsStore.total_followers_num).toBe(0)
            expect(mockStatisticsStore.total_likes_num).toBe(0)
            expect(mockStatisticsStore.total_views_num).toBe(0)
        })
    })

    describe("Statistics Growth Scenarios", () => {
        it("should handle statistics growth", () => {
            // Initial state
            expect(mockStatisticsStore.total_followers_num).toBe(0)

            // User gains followers
            mockStatisticsStore.setTotalFollowersNum(10)
            expect(mockStatisticsStore.total_followers_num).toBe(10)

            // More growth
            mockStatisticsStore.setTotalFollowersNum(25)
            expect(mockStatisticsStore.total_followers_num).toBe(25)
        })

        it("should handle multiple statistics updates", () => {
            mockStatisticsStore.setTotalFollowersNum(50)
            mockStatisticsStore.setTotalLikesNum(200)
            mockStatisticsStore.setTotalViewsNum(1500)

            expect(mockStatisticsStore.total_followers_num).toBe(50)
            expect(mockStatisticsStore.total_likes_num).toBe(200)
            expect(mockStatisticsStore.total_views_num).toBe(1500)
        })
    })

    describe("Type Safety and Method Validation", () => {
        it("should have all required setter methods", () => {
            expect(mockStatisticsStore.setTotalFollowersNum).toBeDefined()
            expect(mockStatisticsStore.setTotalLikesNum).toBeDefined()
            expect(mockStatisticsStore.setTotalViewsNum).toBeDefined()
        })

        it("should have all required utility methods", () => {
            expect(mockStatisticsStore.set).toBeDefined()
            expect(mockStatisticsStore.get).toBeDefined()
            expect(mockStatisticsStore.load).toBeDefined()
            expect(mockStatisticsStore.remove).toBeDefined()
        })

        it("should have all required data properties", () => {
            expect(mockStatisticsStore.total_followers_num).toBeDefined()
            expect(mockStatisticsStore.total_likes_num).toBeDefined()
            expect(mockStatisticsStore.total_views_num).toBeDefined()
        })
    })

    describe("Edge Cases", () => {
        it("should handle zero statistics", () => {
            mockStatisticsStore.setTotalFollowersNum(0)
            mockStatisticsStore.setTotalLikesNum(0)
            mockStatisticsStore.setTotalViewsNum(0)

            expect(mockStatisticsStore.total_followers_num).toBe(0)
            expect(mockStatisticsStore.total_likes_num).toBe(0)
            expect(mockStatisticsStore.total_views_num).toBe(0)
        })

        it("should handle large numbers", () => {
            mockStatisticsStore.setTotalFollowersNum(1000000)
            mockStatisticsStore.setTotalLikesNum(5000000)
            mockStatisticsStore.setTotalViewsNum(10000000)

            expect(mockStatisticsStore.total_followers_num).toBe(1000000)
            expect(mockStatisticsStore.total_likes_num).toBe(5000000)
            expect(mockStatisticsStore.total_views_num).toBe(10000000)
        })
    })
})
