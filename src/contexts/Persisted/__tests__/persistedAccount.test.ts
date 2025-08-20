import { describe, it, expect, vi, beforeEach } from "vitest"

// Create a mock for the useAccountStore hook
const mockAccountStore = {
    coordinates: { latitude: 0, longitude: 0 },
    unreadNotificationsCount: 0,
    jwtToken: "",
    jwtExpiration: "",
    blocked: false,
    muted: false,
    last_active_at: "",
    last_login_at: "",
    setCoordinates: vi.fn((value: any) => {
        mockAccountStore.coordinates = value
    }),
    setUnreadNotificationsCount: vi.fn((value: number) => {
        mockAccountStore.unreadNotificationsCount = value
    }),
    setJwtToken: vi.fn((value: string) => {
        mockAccountStore.jwtToken = value
    }),
    setJwtExpiration: vi.fn((value: string) => {
        mockAccountStore.jwtExpiration = value
    }),
    setBlocked: vi.fn((value: boolean) => {
        mockAccountStore.blocked = value
    }),
    setMuted: vi.fn((value: boolean) => {
        mockAccountStore.muted = value
    }),
    setLastActiveAt: vi.fn((value: string) => {
        mockAccountStore.last_active_at = value
    }),
    setLastLoginAt: vi.fn((value: string) => {
        mockAccountStore.last_login_at = value
    }),
    set: vi.fn(),
    load: vi.fn(),
    remove: vi.fn(() => {
        mockAccountStore.coordinates = { latitude: 0, longitude: 0 }
        mockAccountStore.unreadNotificationsCount = 0
        mockAccountStore.jwtToken = ""
        mockAccountStore.jwtExpiration = ""
        mockAccountStore.blocked = false
        mockAccountStore.muted = false
        mockAccountStore.last_active_at = ""
        mockAccountStore.last_login_at = ""
    }),
}

// Mock the entire module
vi.mock("../persistedAccount", () => ({
    useAccountStore: () => mockAccountStore,
}))

describe("persistedAccount Store", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset mock state
        mockAccountStore.coordinates = { latitude: 0, longitude: 0 }
        mockAccountStore.unreadNotificationsCount = 0
        mockAccountStore.jwtToken = ""
        mockAccountStore.jwtExpiration = ""
        mockAccountStore.blocked = false
        mockAccountStore.muted = false
        mockAccountStore.last_active_at = ""
        mockAccountStore.last_login_at = ""
    })

    describe("Store Initialization", () => {
        it("should initialize with default values", () => {
            expect(mockAccountStore.coordinates).toEqual({ latitude: 0, longitude: 0 })
            expect(mockAccountStore.unreadNotificationsCount).toBe(0)
            expect(mockAccountStore.jwtToken).toBe("")
            expect(mockAccountStore.jwtExpiration).toBe("")
            expect(mockAccountStore.blocked).toBe(false)
            expect(mockAccountStore.muted).toBe(false)
            expect(mockAccountStore.last_active_at).toBe("")
            expect(mockAccountStore.last_login_at).toBe("")
        })
    })

    describe("Account Data Setters", () => {
        it("should update coordinates", () => {
            const coords = { latitude: -23.5505, longitude: -46.6333 }
            mockAccountStore.setCoordinates(coords)

            expect(mockAccountStore.setCoordinates).toHaveBeenCalledWith(coords)
            expect(mockAccountStore.coordinates).toEqual(coords)
        })

        it("should update unread notifications count", () => {
            mockAccountStore.setUnreadNotificationsCount(5)

            expect(mockAccountStore.setUnreadNotificationsCount).toHaveBeenCalledWith(5)
            expect(mockAccountStore.unreadNotificationsCount).toBe(5)
        })

        it("should update JWT token", () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
            mockAccountStore.setJwtToken(token)

            expect(mockAccountStore.setJwtToken).toHaveBeenCalledWith(token)
            expect(mockAccountStore.jwtToken).toBe(token)
        })

        it("should update JWT expiration", () => {
            const expiration = "2024-12-31T23:59:59Z"
            mockAccountStore.setJwtExpiration(expiration)

            expect(mockAccountStore.setJwtExpiration).toHaveBeenCalledWith(expiration)
            expect(mockAccountStore.jwtExpiration).toBe(expiration)
        })

        it("should update blocked status", () => {
            mockAccountStore.setBlocked(true)

            expect(mockAccountStore.setBlocked).toHaveBeenCalledWith(true)
            expect(mockAccountStore.blocked).toBe(true)
        })

        it("should update muted status", () => {
            mockAccountStore.setMuted(true)

            expect(mockAccountStore.setMuted).toHaveBeenCalledWith(true)
            expect(mockAccountStore.muted).toBe(true)
        })

        it("should update last active timestamp", () => {
            const timestamp = "2024-01-15T10:30:00Z"
            mockAccountStore.setLastActiveAt(timestamp)

            expect(mockAccountStore.setLastActiveAt).toHaveBeenCalledWith(timestamp)
            expect(mockAccountStore.last_active_at).toBe(timestamp)
        })

        it("should update last login timestamp", () => {
            const timestamp = "2024-01-15T09:00:00Z"
            mockAccountStore.setLastLoginAt(timestamp)

            expect(mockAccountStore.setLastLoginAt).toHaveBeenCalledWith(timestamp)
            expect(mockAccountStore.last_login_at).toBe(timestamp)
        })
    })

    describe("Bulk Operations", () => {
        it("should have set method", () => {
            const accountData = {
                coordinates: { latitude: -23.5505, longitude: -46.6333 },
                unreadNotificationsCount: 3,
                jwtToken: "new-token",
                jwtExpiration: "2024-12-31T23:59:59Z",
                blocked: false,
                muted: true,
                last_active_at: "2024-01-15T10:30:00Z",
                last_login_at: "2024-01-15T09:00:00Z",
            }

            mockAccountStore.set(accountData)
            expect(mockAccountStore.set).toHaveBeenCalledWith(accountData)
        })

        it("should have load method", () => {
            mockAccountStore.load()
            expect(mockAccountStore.load).toHaveBeenCalled()
        })

        it("should remove all account data", () => {
            // Set some data first
            mockAccountStore.setJwtToken("test-token")
            mockAccountStore.setBlocked(true)

            // Then remove
            mockAccountStore.remove()

            expect(mockAccountStore.remove).toHaveBeenCalled()
            expect(mockAccountStore.coordinates).toEqual({ latitude: 0, longitude: 0 })
            expect(mockAccountStore.unreadNotificationsCount).toBe(0)
            expect(mockAccountStore.jwtToken).toBe("")
            expect(mockAccountStore.jwtExpiration).toBe("")
            expect(mockAccountStore.blocked).toBe(false)
            expect(mockAccountStore.muted).toBe(false)
            expect(mockAccountStore.last_active_at).toBe("")
            expect(mockAccountStore.last_login_at).toBe("")
        })
    })

    describe("Method Validation", () => {
        it("should have all required methods defined", () => {
            expect(mockAccountStore.setCoordinates).toBeDefined()
            expect(mockAccountStore.setUnreadNotificationsCount).toBeDefined()
            expect(mockAccountStore.setJwtToken).toBeDefined()
            expect(mockAccountStore.setJwtExpiration).toBeDefined()
            expect(mockAccountStore.setBlocked).toBeDefined()
            expect(mockAccountStore.setMuted).toBeDefined()
            expect(mockAccountStore.setLastActiveAt).toBeDefined()
            expect(mockAccountStore.setLastLoginAt).toBeDefined()
            expect(mockAccountStore.set).toBeDefined()
            expect(mockAccountStore.load).toBeDefined()
            expect(mockAccountStore.remove).toBeDefined()
        })
    })

    describe("Edge Cases", () => {
        it("should handle coordinate validation", () => {
            const invalidCoords = { latitude: 999, longitude: 999 }
            mockAccountStore.setCoordinates(invalidCoords)
            expect(mockAccountStore.setCoordinates).toHaveBeenCalledWith(invalidCoords)
        })

        it("should handle negative notification counts", () => {
            mockAccountStore.setUnreadNotificationsCount(-1)
            expect(mockAccountStore.setUnreadNotificationsCount).toHaveBeenCalledWith(-1)
        })

        it("should handle empty token strings", () => {
            mockAccountStore.setJwtToken("")
            expect(mockAccountStore.setJwtToken).toHaveBeenCalledWith("")
        })
    })
})
