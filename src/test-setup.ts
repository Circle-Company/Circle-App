// Setup global para Vitest
import { vi } from "vitest"

// Mock básico para React Native
global.fetch = vi.fn()

// `expo-modules-core` lê `globalThis.expo`, que normalmente é instalado pelo
// runtime nativo. Sem este shim, qualquer import que chegue nele morre com
// "Cannot read properties of undefined (reading 'EventEmitter')" antes mesmo
// de a suíte começar.
class MockEventEmitter {
    private listeners = new Map<string, Set<(...args: any[]) => void>>()

    addListener(event: string, listener: (...args: any[]) => void) {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set())
        this.listeners.get(event)!.add(listener)
        return { remove: () => this.listeners.get(event)?.delete(listener) }
    }

    removeAllListeners(event: string) {
        this.listeners.delete(event)
    }

    emit(event: string, ...args: any[]) {
        this.listeners.get(event)?.forEach((listener) => listener(...args))
    }
}

;(globalThis as any).expo = {
    EventEmitter: MockEventEmitter,
    NativeModule: class {},
    SharedObject: class {},
    SharedRef: class {},
    modules: {},
    uuidv4: () => "00000000-0000-4000-8000-000000000000",
    uuidv5: () => "00000000-0000-5000-8000-000000000000",
    getViewConfig: () => null,
    reloadAppAsync: vi.fn(),
}

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
    Image: {
        prefetch: vi.fn(() => Promise.resolve(true)),
        getSize: vi.fn(),
        resolveAssetSource: vi.fn(() => ({ uri: "" })),
    },
}))

// Mock para React Native MMKV
vi.mock("react-native-mmkv", () => ({
    MMKV: vi.fn().mockImplementation(() => ({
        set: vi.fn(),
        getString: vi.fn(),
        getNumber: vi.fn(),
        getBoolean: vi.fn(),
        remove: vi.fn(),
        clearAll: vi.fn(),
    })),
}))

// Mock para módulos de navegação
vi.mock("expo-router/react-navigation", () => ({
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
    debounce: vi.fn((fn: Function, _delay: number) => fn),
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
        remove: vi.fn(),
    },
    // Espelha `storageKeys()` de verdade, chave por chave. A versão anterior deste mock era
    // um fóssil: declarava `history.search`, `account.muted`, `deviceMetadata`,
    // `user.profile_picture.small` e `preferences.likeMoment` — nomes que **nunca**
    // existiram na tabela real. Um mock que inventa chaves esconde justamente o tipo de bug
    // que este arquivo deveria ajudar a pegar: código lendo uma chave que ninguém grava.
    storageKeys: vi.fn(() => ({
        baseKey: "@circle:",
        clockOffset: "@circle:clockoffset",
        account: {
            coordinates: {
                lastSyncAt: "@circle:account:coordinates:lastsyncat",
            },
            blocked: "@circle:account:block",
            accessLevel: "@circle:account:accesslevel",
            verified: "@circle:account:verified",
            deleted: "@circle:account:deleted",
            jwt: {
                expiration: "@circle:account:jwt:expiration",
                token: "@circle:account:jwt:token",
                refreshToken: "@circle:account:jwt:refreshtoken",
            },
        },
        user: {
            id: "@circle:user:id",
            name: "@circle:user:name",
            username: "@circle:user:username",
            profilePicture: "@circle:user:profilepicture",
        },
        permissions: {
            postNotifications: "@circle:permissions:postnotifications",
        },
        tutorial: {
            feed: {
                step1Seen: "@circle:tutorial:feed:step1Seen",
                step2Seen: "@circle:tutorial:feed:step2Seen",
            },
            dismissed: "@circle:tutorial:dismissed",
        },
    })),
}))

// Mock para @/api e services/Api/index
vi.mock("@/api", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}))

vi.mock("@/api/index", () => ({
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
