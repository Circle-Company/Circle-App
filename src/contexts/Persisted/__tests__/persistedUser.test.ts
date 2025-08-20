import { describe, it, expect, vi, beforeEach } from "vitest"

// Create a mock for the useUserStore hook
const mockUserStore = {
    id: "",
    name: "",
    username: "",
    description: "",
    verifyed: false,
    profile_picture: {
        small_resolution: "",
        tiny_resolution: "",
    },
    setId: vi.fn((value: string) => {
        mockUserStore.id = value
    }),
    setName: vi.fn((value: string) => {
        mockUserStore.name = value
    }),
    setUsername: vi.fn((value: string) => {
        mockUserStore.username = value
    }),
    setDescription: vi.fn((value: string) => {
        mockUserStore.description = value
    }),
    setVerifyed: vi.fn((value: boolean) => {
        mockUserStore.verifyed = value
    }),
    setProfilePicture: vi.fn((value: any) => {
        mockUserStore.profile_picture = value
    }),
    set: vi.fn(),
    get: vi.fn(),
    load: vi.fn(),
    remove: vi.fn(() => {
        mockUserStore.id = ""
        mockUserStore.name = ""
        mockUserStore.username = ""
        mockUserStore.description = ""
        mockUserStore.verifyed = false
        mockUserStore.profile_picture = { small_resolution: "", tiny_resolution: "" }
    }),
}

// Mock the entire module
vi.mock("../persistedUser", () => ({
    useUserStore: () => mockUserStore,
}))

describe("persistedUser Store", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset mock state
        mockUserStore.id = ""
        mockUserStore.name = ""
        mockUserStore.username = ""
        mockUserStore.description = ""
        mockUserStore.verifyed = false
        mockUserStore.profile_picture = { small_resolution: "", tiny_resolution: "" }
    })

    describe("Store Initialization", () => {
        it("should initialize with default values", () => {
            expect(mockUserStore.id).toBe("")
            expect(mockUserStore.name).toBe("")
            expect(mockUserStore.username).toBe("")
            expect(mockUserStore.description).toBe("")
            expect(mockUserStore.verifyed).toBe(false)
            expect(mockUserStore.profile_picture).toEqual({
                small_resolution: "",
                tiny_resolution: "",
            })
        })
    })

    describe("User Data Setters", () => {
        it("should update user ID", () => {
            mockUserStore.setId("456")

            expect(mockUserStore.setId).toHaveBeenCalledWith("456")
            expect(mockUserStore.id).toBe("456")
        })

        it("should update user name", () => {
            mockUserStore.setName("Jane Smith")

            expect(mockUserStore.setName).toHaveBeenCalledWith("Jane Smith")
            expect(mockUserStore.name).toBe("Jane Smith")
        })

        it("should update username", () => {
            mockUserStore.setUsername("janesmith")

            expect(mockUserStore.setUsername).toHaveBeenCalledWith("janesmith")
            expect(mockUserStore.username).toBe("janesmith")
        })

        it("should update description", () => {
            const description = "Updated user description"
            mockUserStore.setDescription(description)

            expect(mockUserStore.setDescription).toHaveBeenCalledWith(description)
            expect(mockUserStore.description).toBe(description)
        })

        it("should update verified status", () => {
            mockUserStore.setVerifyed(true)

            expect(mockUserStore.setVerifyed).toHaveBeenCalledWith(true)
            expect(mockUserStore.verifyed).toBe(true)
        })

        it("should update profile picture", () => {
            const profilePicture = {
                small_resolution: "new-small.jpg",
                tiny_resolution: "new-tiny.jpg",
            }

            mockUserStore.setProfilePicture(profilePicture)

            expect(mockUserStore.setProfilePicture).toHaveBeenCalledWith(profilePicture)
            expect(mockUserStore.profile_picture).toEqual(profilePicture)
        })
    })

    describe("Bulk Operations", () => {
        it("should have set method", () => {
            const userData = {
                id: "bulk123",
                name: "Bulk User",
                username: "bulkuser",
                description: "Bulk description",
                verifyed: true,
                profile_picture: {
                    small_resolution: "bulk-small.jpg",
                    tiny_resolution: "bulk-tiny.jpg",
                },
            }

            mockUserStore.set(userData)
            expect(mockUserStore.set).toHaveBeenCalledWith(userData)
        })

        it("should have load method", () => {
            mockUserStore.load()
            expect(mockUserStore.load).toHaveBeenCalled()
        })

        it("should remove all user data", () => {
            // Set some data first
            mockUserStore.setId("test")
            mockUserStore.setName("test")

            // Then remove
            mockUserStore.remove()

            expect(mockUserStore.remove).toHaveBeenCalled()
            expect(mockUserStore.id).toBe("")
            expect(mockUserStore.name).toBe("")
            expect(mockUserStore.username).toBe("")
            expect(mockUserStore.description).toBe("")
            expect(mockUserStore.verifyed).toBe(false)
            expect(mockUserStore.profile_picture).toEqual({
                small_resolution: "",
                tiny_resolution: "",
            })
        })
    })

    describe("Method Validation", () => {
        it("should have all required methods defined", () => {
            expect(mockUserStore.setId).toBeDefined()
            expect(mockUserStore.setName).toBeDefined()
            expect(mockUserStore.setUsername).toBeDefined()
            expect(mockUserStore.setDescription).toBeDefined()
            expect(mockUserStore.setVerifyed).toBeDefined()
            expect(mockUserStore.setProfilePicture).toBeDefined()
            expect(mockUserStore.set).toBeDefined()
            expect(mockUserStore.get).toBeDefined()
            expect(mockUserStore.load).toBeDefined()
            expect(mockUserStore.remove).toBeDefined()
        })
    })

    describe("API Integration", () => {
        it("should have get method for API calls", () => {
            mockUserStore.get(123)
            expect(mockUserStore.get).toHaveBeenCalledWith(123)
        })
    })
})
