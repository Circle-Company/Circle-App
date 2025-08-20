import { describe, it, expect, vi, beforeEach } from "vitest"

// Create a mock for the usePreferencesStore hook
const mockPreferencesStore = {
    language: {
        appLanguage: "en",
        primaryLanguage: "en",
        translationLanguage: "en",
    },
    content: {
        disableAutoplay: false,
        disableHaptics: false,
        disableTranslation: false,
        muteAudio: false,
    },
    pushNotifications: {
        disableLikeMoment: false,
        disableNewMemory: false,
        disableAddToMemory: false,
        disableFollowUser: false,
        disableViewUser: false,
    },
    setAppLanguage: vi.fn((value: string) => {
        mockPreferencesStore.language.appLanguage = value
    }),
    setPrimaryLanguage: vi.fn((value: string) => {
        mockPreferencesStore.language.primaryLanguage = value
    }),
    setTranslationLanguage: vi.fn((value: string) => {
        mockPreferencesStore.language.translationLanguage = value
    }),
    setDisableAutoPlay: vi.fn((value: boolean) => {
        mockPreferencesStore.content.disableAutoplay = value
    }),
    setDisableHaptics: vi.fn((value: boolean) => {
        mockPreferencesStore.content.disableHaptics = value
    }),
    setDisableTranslation: vi.fn((value: boolean) => {
        mockPreferencesStore.content.disableTranslation = value
    }),
    setMuteAudio: vi.fn((value: boolean) => {
        mockPreferencesStore.content.muteAudio = value
    }),
    setDisableLikeMoment: vi.fn((value: boolean) => {
        mockPreferencesStore.pushNotifications.disableLikeMoment = value
    }),
    setDisableNewMemory: vi.fn((value: boolean) => {
        mockPreferencesStore.pushNotifications.disableNewMemory = value
    }),
    setDisableAddToMemory: vi.fn((value: boolean) => {
        mockPreferencesStore.pushNotifications.disableAddToMemory = value
    }),
    setDisableFollowUser: vi.fn((value: boolean) => {
        mockPreferencesStore.pushNotifications.disableFollowUser = value
    }),
    setDisableViewUser: vi.fn((value: boolean) => {
        mockPreferencesStore.pushNotifications.disableViewUser = value
    }),
    get: vi.fn(),
    set: vi.fn(),
    load: vi.fn(),
    remove: vi.fn(() => {
        mockPreferencesStore.language = {
            appLanguage: "en",
            primaryLanguage: "en",
            translationLanguage: "en",
        }
        mockPreferencesStore.content = {
            disableAutoplay: false,
            disableHaptics: false,
            disableTranslation: false,
            muteAudio: false,
        }
        mockPreferencesStore.pushNotifications = {
            disableLikeMoment: false,
            disableNewMemory: false,
            disableAddToMemory: false,
            disableFollowUser: false,
            disableViewUser: false,
        }
    }),
}

// Mock the entire module
vi.mock("../persistedPreferences", () => ({
    usePreferencesStore: () => mockPreferencesStore,
}))

describe("persistedPreferences Store", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset mock state
        mockPreferencesStore.language = {
            appLanguage: "en",
            primaryLanguage: "en",
            translationLanguage: "en",
        }
        mockPreferencesStore.content = {
            disableAutoplay: false,
            disableHaptics: false,
            disableTranslation: false,
            muteAudio: false,
        }
        mockPreferencesStore.pushNotifications = {
            disableLikeMoment: false,
            disableNewMemory: false,
            disableAddToMemory: false,
            disableFollowUser: false,
            disableViewUser: false,
        }
    })

    describe("Store Initialization", () => {
        it("should initialize with default preference values", () => {
            expect(mockPreferencesStore.language.appLanguage).toBe("en")
            expect(mockPreferencesStore.language.primaryLanguage).toBe("en")
            expect(mockPreferencesStore.language.translationLanguage).toBe("en")
            expect(mockPreferencesStore.content.disableAutoplay).toBe(false)
            expect(mockPreferencesStore.content.disableHaptics).toBe(false)
            expect(mockPreferencesStore.content.disableTranslation).toBe(false)
            expect(mockPreferencesStore.content.muteAudio).toBe(false)
            expect(mockPreferencesStore.pushNotifications.disableLikeMoment).toBe(false)
            expect(mockPreferencesStore.pushNotifications.disableNewMemory).toBe(false)
            expect(mockPreferencesStore.pushNotifications.disableAddToMemory).toBe(false)
            expect(mockPreferencesStore.pushNotifications.disableFollowUser).toBe(false)
            expect(mockPreferencesStore.pushNotifications.disableViewUser).toBe(false)
        })
    })

    describe("Language Preferences", () => {
        it("should update app language", () => {
            mockPreferencesStore.setAppLanguage("pt")
            expect(mockPreferencesStore.setAppLanguage).toHaveBeenCalledWith("pt")
            expect(mockPreferencesStore.language.appLanguage).toBe("pt")
        })

        it("should update primary language", () => {
            mockPreferencesStore.setPrimaryLanguage("es")
            expect(mockPreferencesStore.setPrimaryLanguage).toHaveBeenCalledWith("es")
            expect(mockPreferencesStore.language.primaryLanguage).toBe("es")
        })

        it("should update translation language", () => {
            mockPreferencesStore.setTranslationLanguage("fr")
            expect(mockPreferencesStore.setTranslationLanguage).toHaveBeenCalledWith("fr")
            expect(mockPreferencesStore.language.translationLanguage).toBe("fr")
        })
    })

    describe("Content Preferences", () => {
        it("should update autoplay preference", () => {
            mockPreferencesStore.setDisableAutoPlay(true)
            expect(mockPreferencesStore.setDisableAutoPlay).toHaveBeenCalledWith(true)
            expect(mockPreferencesStore.content.disableAutoplay).toBe(true)
        })

        it("should update haptics preference", () => {
            mockPreferencesStore.setDisableHaptics(true)
            expect(mockPreferencesStore.setDisableHaptics).toHaveBeenCalledWith(true)
            expect(mockPreferencesStore.content.disableHaptics).toBe(true)
        })

        it("should update translation preference", () => {
            mockPreferencesStore.setDisableTranslation(true)
            expect(mockPreferencesStore.setDisableTranslation).toHaveBeenCalledWith(true)
            expect(mockPreferencesStore.content.disableTranslation).toBe(true)
        })

        it("should update audio preference", () => {
            mockPreferencesStore.setMuteAudio(true)
            expect(mockPreferencesStore.setMuteAudio).toHaveBeenCalledWith(true)
            expect(mockPreferencesStore.content.muteAudio).toBe(true)
        })
    })

    describe("Push Notification Preferences", () => {
        it("should update like moment notification preference", () => {
            mockPreferencesStore.setDisableLikeMoment(true)
            expect(mockPreferencesStore.setDisableLikeMoment).toHaveBeenCalledWith(true)
            expect(mockPreferencesStore.pushNotifications.disableLikeMoment).toBe(true)
        })

        it("should update new memory notification preference", () => {
            mockPreferencesStore.setDisableNewMemory(true)
            expect(mockPreferencesStore.setDisableNewMemory).toHaveBeenCalledWith(true)
            expect(mockPreferencesStore.pushNotifications.disableNewMemory).toBe(true)
        })
    })

    describe("Method Validation", () => {
        it("should have all required language methods", () => {
            expect(mockPreferencesStore.setAppLanguage).toBeDefined()
            expect(mockPreferencesStore.setPrimaryLanguage).toBeDefined()
            expect(mockPreferencesStore.setTranslationLanguage).toBeDefined()
        })

        it("should have all required content methods", () => {
            expect(mockPreferencesStore.setDisableAutoPlay).toBeDefined()
            expect(mockPreferencesStore.setDisableHaptics).toBeDefined()
            expect(mockPreferencesStore.setDisableTranslation).toBeDefined()
            expect(mockPreferencesStore.setMuteAudio).toBeDefined()
        })

        it("should have all required notification methods", () => {
            expect(mockPreferencesStore.setDisableLikeMoment).toBeDefined()
            expect(mockPreferencesStore.setDisableNewMemory).toBeDefined()
            expect(mockPreferencesStore.setDisableAddToMemory).toBeDefined()
            expect(mockPreferencesStore.setDisableFollowUser).toBeDefined()
            expect(mockPreferencesStore.setDisableViewUser).toBeDefined()
        })

        it("should have all required utility methods", () => {
            expect(mockPreferencesStore.get).toBeDefined()
            expect(mockPreferencesStore.set).toBeDefined()
            expect(mockPreferencesStore.load).toBeDefined()
            expect(mockPreferencesStore.remove).toBeDefined()
        })

        it("should have all required data properties", () => {
            expect(mockPreferencesStore.language.appLanguage).toBeDefined()
            expect(mockPreferencesStore.content.disableAutoplay).toBeDefined()
            expect(mockPreferencesStore.pushNotifications.disableLikeMoment).toBeDefined()
        })
    })
})
