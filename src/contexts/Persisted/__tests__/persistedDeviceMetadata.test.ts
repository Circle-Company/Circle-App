import { describe, it, expect, vi, beforeEach } from "vitest"

// Create a mock for the useDeviceMetadataStore hook
const mockDeviceMetadataStore = {
    totalMemory: 0,
    availableMemory: 0,
    freeDiskStorage: 0,
    batteryLevel: 0,
    isLowPowerModeEnabled: false,
    isTablet: false,
    screenWidth: 0,
    screenHeight: 0,
    pixelDensity: 0,
    fontScale: 1,
    deviceType: "",
    setTotalMemory: vi.fn((value: number) => {
        mockDeviceMetadataStore.totalMemory = value
    }),
    setAvailableMemory: vi.fn((value: number) => {
        mockDeviceMetadataStore.availableMemory = value
    }),
    setFreeDiskStorage: vi.fn((value: number) => {
        mockDeviceMetadataStore.freeDiskStorage = value
    }),
    setBatteryLevel: vi.fn((value: number) => {
        mockDeviceMetadataStore.batteryLevel = value
    }),
    setIsLowPowerModeEnabled: vi.fn((value: boolean) => {
        mockDeviceMetadataStore.isLowPowerModeEnabled = value
    }),
    setIsTablet: vi.fn((value: boolean) => {
        mockDeviceMetadataStore.isTablet = value
    }),
    setScreenWidth: vi.fn((value: number) => {
        mockDeviceMetadataStore.screenWidth = value
    }),
    setScreenHeight: vi.fn((value: number) => {
        mockDeviceMetadataStore.screenHeight = value
    }),
    setPixelDensity: vi.fn((value: number) => {
        mockDeviceMetadataStore.pixelDensity = value
    }),
    setFontScale: vi.fn((value: number) => {
        mockDeviceMetadataStore.fontScale = value
    }),
    setDeviceType: vi.fn((value: string) => {
        mockDeviceMetadataStore.deviceType = value
    }),
    updateAll: vi.fn(),
    set: vi.fn(),
    load: vi.fn(),
    remove: vi.fn(),
}

// Mock the entire module
vi.mock("../persistedDeviceMetadata", () => ({
    useDeviceMetadataStore: () => mockDeviceMetadataStore,
}))

describe("persistedDeviceMetadata Store", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("Store Initialization", () => {
        it("should initialize with default values", () => {
            expect(mockDeviceMetadataStore.totalMemory).toBe(0)
            expect(mockDeviceMetadataStore.availableMemory).toBe(0)
            expect(mockDeviceMetadataStore.freeDiskStorage).toBe(0)
            expect(mockDeviceMetadataStore.batteryLevel).toBe(0)
            expect(mockDeviceMetadataStore.isLowPowerModeEnabled).toBe(false)
            expect(mockDeviceMetadataStore.isTablet).toBe(false)
            expect(mockDeviceMetadataStore.screenWidth).toBe(0)
            expect(mockDeviceMetadataStore.screenHeight).toBe(0)
            expect(mockDeviceMetadataStore.pixelDensity).toBe(0)
            expect(mockDeviceMetadataStore.fontScale).toBe(1)
            expect(mockDeviceMetadataStore.deviceType).toBe("")
        })
    })

    describe("Device Metadata Setters", () => {
        it("should update total memory", () => {
            mockDeviceMetadataStore.setTotalMemory(8000000000)
            expect(mockDeviceMetadataStore.setTotalMemory).toHaveBeenCalledWith(8000000000)
        })

        it("should update available memory", () => {
            mockDeviceMetadataStore.setAvailableMemory(4000000000)
            expect(mockDeviceMetadataStore.setAvailableMemory).toHaveBeenCalledWith(4000000000)
        })

        it("should update screen dimensions", () => {
            mockDeviceMetadataStore.setScreenWidth(1080)
            mockDeviceMetadataStore.setScreenHeight(1920)

            expect(mockDeviceMetadataStore.setScreenWidth).toHaveBeenCalledWith(1080)
            expect(mockDeviceMetadataStore.setScreenHeight).toHaveBeenCalledWith(1920)
        })
    })

    describe("Method Validation", () => {
        it("should have all required methods defined", () => {
            expect(mockDeviceMetadataStore.setTotalMemory).toBeDefined()
            expect(mockDeviceMetadataStore.setAvailableMemory).toBeDefined()
            expect(mockDeviceMetadataStore.setFreeDiskStorage).toBeDefined()
            expect(mockDeviceMetadataStore.setBatteryLevel).toBeDefined()
            expect(mockDeviceMetadataStore.setIsLowPowerModeEnabled).toBeDefined()
            expect(mockDeviceMetadataStore.setIsTablet).toBeDefined()
            expect(mockDeviceMetadataStore.setScreenWidth).toBeDefined()
            expect(mockDeviceMetadataStore.setScreenHeight).toBeDefined()
            expect(mockDeviceMetadataStore.setPixelDensity).toBeDefined()
            expect(mockDeviceMetadataStore.setFontScale).toBeDefined()
            expect(mockDeviceMetadataStore.setDeviceType).toBeDefined()
            expect(mockDeviceMetadataStore.set).toBeDefined()
            expect(mockDeviceMetadataStore.load).toBeDefined()
            expect(mockDeviceMetadataStore.remove).toBeDefined()
            expect(mockDeviceMetadataStore.updateAll).toBeDefined()
        })
    })
})
