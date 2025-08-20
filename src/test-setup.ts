// Setup global para Vitest
import { vi } from "vitest"

// Mock básico para React Native
global.fetch = vi.fn()

// Mock para console para evitar logs desnecessários nos testes
Object.assign(console, {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
})

// Mock para módulos React Native que não são usados nos testes
vi.mock("react-native", () => ({
    Platform: {
        OS: "ios",
        select: vi.fn(),
    },
    Dimensions: {
        get: vi.fn(() => ({ width: 375, height: 812 })),
    },
    Alert: {
        alert: vi.fn(),
    },
}))

// Mock para React Native MMKV
vi.mock("react-native-mmkv", () => ({
    MMKV: vi.fn().mockImplementation(() => ({
        set: vi.fn(),
        getString: vi.fn(),
        getNumber: vi.fn(),
        getBoolean: vi.fn(),
        delete: vi.fn(),
        clearAll: vi.fn(),
    })),
}))

// Mock para módulos de navegação
vi.mock("@react-navigation/native", () => ({
    useNavigation: vi.fn(),
    useFocusEffect: vi.fn(),
}))

// Mock para expo
vi.mock("expo-constants", () => ({
    default: {
        expoConfig: {
            extra: {},
        },
    },
}))

// Mock para TimerUtil usado no useTimer
vi.mock("@/helpers/debounce", () => ({
    debounce: vi.fn((fn: Function, delay: number) => fn),
}))

// Mock para axios se necessário
vi.mock("axios", () => ({
    default: {
        create: vi.fn(() => ({
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        })),
    },
}))

// Mock para variáveis de ambiente
vi.mock("@env", () => ({
    APP_VERSION: "1.0.0",
    DEBUG: true,
    MIXPANEL_KEY: "test-key",
    NODE_ENV: "test",
}))

// Mock para @/store
vi.mock("@/store", () => ({
    storage: {
        getNumber: vi.fn(() => 0),
        getString: vi.fn(() => ""),
        getBoolean: vi.fn(() => false),
        set: vi.fn(),
        delete: vi.fn(),
    },
    storageKeys: vi.fn(() => ({
        deviceMetadata: {
            totalMemory: "totalMemory",
            availableMemory: "availableMemory",
            freeDiskStorage: "freeDiskStorage",
            batteryLevel: "batteryLevel",
            isLowPowerModeEnabled: "isLowPowerModeEnabled",
            isTablet: "isTablet",
            screenWidth: "screenWidth",
            screenHeight: "screenHeight",
            pixelDensity: "pixelDensity",
            fontScale: "fontScale",
            deviceType: "deviceType",
        },
    })),
}))

// Mock para @/services/Api
vi.mock("@/services/Api", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}))

// Mock para contextos
vi.mock("@/contexts/Persisted", () => ({
    default: {
        session: {
            account: {
                jwtToken: "test-token",
            },
            user: {
                id: 1,
                username: "testuser",
            },
        },
        device: {
            metadata: {
                deviceId: "test-device",
                totalMemory: 4000000000,
                availableMemory: 2000000000,
                isTablet: false,
                screenWidth: 375,
                screenHeight: 812,
                pixelDensity: 2,
                fontScale: 1,
            },
        },
    },
}))

// Mock para React hooks
vi.mock("react", async () => {
    const actual = await vi.importActual("react")
    return {
        ...actual,
        useContext: vi.fn(() => ({
            session: {
                account: {
                    jwtToken: "test-token",
                },
                user: {
                    id: 1,
                    username: "testuser",
                },
            },
        })),
    }
})
