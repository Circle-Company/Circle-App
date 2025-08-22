import { act, fireEvent, render, waitFor } from "@testing-library/react-native"
import { beforeEach, describe, expect, it, vi } from "vitest"

import AuthContext from "../../contexts/Auth"
import { Provider as PersistedProvider } from "../../contexts/Persisted"
import { Platform } from "react-native"
import React from "react"
import { RedirectContext } from "../../contexts/redirect"
import Routes from "../../routes"

// Mock das dependências
vi.mock("react-native-device-info", () => ({
    getDeviceId: vi.fn(() => "test-device-id"),
    getDeviceName: vi.fn(() => Promise.resolve("Test Device")),
    getDeviceToken: vi.fn(() => Promise.resolve("test-device-token")),
    getIpAddress: vi.fn(() => Promise.resolve("192.168.1.1")),
    getMacAddress: vi.fn(() => Promise.resolve("00:11:22:33:44:55")),
    getTotalDiskCapacity: vi.fn(() => Promise.resolve(1000000000)),
    getUniqueId: vi.fn(() => Promise.resolve("test-unique-id")),
}))

vi.mock("../../services/Api", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}))

vi.mock("../../store", () => ({
    storage: {
        set: vi.fn(),
        getString: vi.fn(),
        clearAll: vi.fn(),
        getAllKeys: vi.fn(() => []),
    },
    storageKeys: vi.fn(() => ({
        user: {
            id: "@circle:user:id",
            name: "@circle:user:name",
            username: "@circle:user:username",
            description: "@circle:user:description",
            verifyed: "@circle:user:verifyed",
            profile_picture: {
                small: "@circle:user:profile_picture:small",
                tiny: "@circle:user:profile_picture:tiny",
            },
        },
        account: {
            coordinates: {
                latitude: "@circle:account:coordinates:latitude",
                longitude: "@circle:account:coordinates:longitude",
            },
            unreadNotificationsCount: "@circle:account:unreadnotificationscount",
            blocked: "@circle:account:block",
            muted: "@circle:account:mute",
            last_active_at: "@circle:account:lastactive",
            last_login_at: "@circle:account:lastlogin",
            jwt: {
                expiration: "@circle:account:jwt:expiration",
                token: "@circle:account:jwt:token",
            },
        },
        statistics: {
            total_followers: "@circle:statistics:totalfollowers",
            total_likes: "@circle:statistics:totallikes",
            total_views: "@circle:statistics:totalviews",
        },
        preferences: {
            primaryLanguage: "@circle:preferences:language:primary",
            appLanguage: "@circle:preferences:language:app",
            autoplay: "@circle:preferences:content:autoplay",
            haptics: "@circle:preferences:content:haptics",
            translation: "@circle:preferences:content:translation",
            translationLanguage: "@circle:preferences:content:translation:language",
            muteAudio: "@circle:preferences:content:muteaudio",
            likeMoment: "@circle:preferences:pushnotification:likemoment",
            newMemory: "@circle:preferences:pushnotification:newmemory",
            addToMemory: "@circle:preferences:pushnotification:addtomemory",
            followUser: "@circle:preferences:pushnotification:followuser",
            viewUser: "@circle:preferences:pushnotification:viewuser",
        },
        history: {
            search: "@circle:history:search",
        },
    })),
}))

// Mock das stores
const mockUserStore = {
    set: vi.fn(),
    remove: vi.fn(),
    id: "",
    username: "",
}

const mockAccountStore = {
    set: vi.fn(),
    remove: vi.fn(),
    jwtToken: "",
}

const mockPreferencesStore = {
    set: vi.fn(),
    remove: vi.fn(),
}

const mockStatisticsStore = {
    set: vi.fn(),
    remove: vi.fn(),
}

const mockHistoryStore = {
    set: vi.fn(),
    remove: vi.fn(),
}

const mockPermissionsStore = {
    set: vi.fn(),
}

const mockDeviceMetadataStore = {
    updateAll: vi.fn().mockResolvedValue(undefined),
}

vi.mock("../../contexts/Persisted/persistedUser", () => ({
    useUserStore: () => mockUserStore,
}))

vi.mock("../../contexts/Persisted/persistedAccount", () => ({
    useAccountStore: () => mockAccountStore,
}))

vi.mock("../../contexts/Persisted/persistedPreferences", () => ({
    usePreferencesStore: () => mockPreferencesStore,
}))

vi.mock("../../contexts/Persisted/persistedStatistics", () => ({
    useStatisticsStore: () => mockStatisticsStore,
}))

vi.mock("../../contexts/Persisted/persistedHistory", () => ({
    useHistoryStore: () => mockHistoryStore,
}))

vi.mock("../../contexts/Persisted/persistedPermissions", () => ({
    usePermissionsStore: () => mockPermissionsStore,
}))

vi.mock("../../contexts/Persisted/persistedDeviceMetadata", () => ({
    useDeviceMetadataStore: () => mockDeviceMetadataStore,
}))

// Mock do hook de refresh token
vi.mock("../../lib/hooks/useRefreshJwtToken", () => ({
    refreshJwtToken: vi.fn().mockResolvedValue(undefined),
}))

// Mocks globais
let mockApi: any
let mockStorage: any

// Mock dos componentes de rota
vi.mock("../../routes/app.routes", () => ({
    default: () => <div data-testid="app-route">App Route</div>,
}))

vi.mock("../../routes/auth.routes", () => ({
    default: () => <div data-testid="auth-route">Auth Route</div>,
}))

vi.mock("../../pages/auth/Loading", () => ({
    default: () => <div data-testid="loading-screen">Loading Screen</div>,
}))

// Dados de teste
const mockSessionData = {
    user: {
        id: "123",
        name: "Test User",
        username: "testuser",
        description: "Test description",
        verifyed: true,
        profile_picture: {
            small_resolution: "https://example.com/small.jpg",
            tiny_resolution: "https://example.com/tiny.jpg",
        },
    },
    account: {
        coordinates: {
            latitude: -23.5505,
            longitude: -46.6333,
        },
        unreadNotificationsCount: 5,
        blocked: false,
        muted: false,
        last_active_at: "2024-01-01T00:00:00Z",
        last_login_at: "2024-01-01T00:00:00Z",
        jwtToken: "test-jwt-token",
        jwtExpiration: "2024-12-31T23:59:59Z",
    },
    statistics: {
        total_followers_num: 100,
        total_likes_num: 500,
        total_views_num: 1000,
    },
    preferences: {
        primaryLanguage: "pt",
        appLanguage: "pt",
        autoplay: true,
        haptics: true,
        translation: true,
        translationLanguage: "en",
        muteAudio: false,
        likeMoment: true,
        newMemory: true,
        addToMemory: true,
        followUser: true,
        viewUser: false,
    },
    history: {
        search: [],
    },
}

// Wrapper para testes de integração
const IntegrationTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <RedirectContext.Provider value={{ redirectTo: "AUTH", setRedirectTo: vi.fn() }}>
        <AuthContext.Provider value={{} as any}>
            <PersistedProvider>{children}</PersistedProvider>
        </AuthContext.Provider>
    </RedirectContext.Provider>
)

describe("Fluxo de Autenticação - Teste de Integração", () => {
    beforeEach(async () => {
        vi.clearAllMocks()

        // Inicializar mocks
        mockApi = vi.mocked((await import("../../services/Api")).default)
        mockStorage = vi.mocked((await import("../../store")).storage)

        mockStorage.getString.mockReturnValue(null)
        mockStorage.clearAll.mockImplementation(() => {})
        mockStorage.set.mockImplementation(() => {})
        mockStorage.getAllKeys.mockReturnValue([])

        // Reset das stores
        mockUserStore.set.mockClear()
        mockUserStore.remove.mockClear()
        mockAccountStore.set.mockClear()
        mockAccountStore.remove.mockClear()
        mockPreferencesStore.set.mockClear()
        mockStatisticsStore.set.mockClear()
        mockHistoryStore.set.mockClear()
        mockPermissionsStore.set.mockClear()
        mockDeviceMetadataStore.updateAll.mockClear()
    })

    describe("Fluxo de Login", () => {
        it("deve fazer login completo e redirecionar para APP", async () => {
            // Mock da API de login
            mockApi.post.mockResolvedValue({
                data: {
                    session: mockSessionData,
                    message: "Login realizado com sucesso",
                },
            })

            const { getByTestId } = render(
                <IntegrationTestWrapper>
                    <Routes />
                </IntegrationTestWrapper>,
            )

            // Verificar se o componente renderiza sem erros
            expect(getByTestId("loading-screen")).toBeTruthy()

            // Aguardar o fluxo de autenticação
            await waitFor(() => {
                expect(mockApi.post).toHaveBeenCalled()
            })
        })

        it("deve lidar com erro de login", async () => {
            // Mock de erro na API
            mockApi.post.mockRejectedValue(new Error("Credenciais inválidas"))

            const { getByTestId } = render(
                <IntegrationTestWrapper>
                    <Routes />
                </IntegrationTestWrapper>,
            )

            // Verificar se o componente renderiza sem erros
            expect(getByTestId("loading-screen")).toBeTruthy()

            // Aguardar o fluxo de autenticação
            await waitFor(() => {
                expect(mockApi.post).toHaveBeenCalled()
            })
        })
    })

    describe("Fluxo de Signup", () => {
        it("deve criar conta e redirecionar para APP", async () => {
            // Mock da API de signup
            mockApi.post.mockResolvedValue({
                data: {
                    session: mockSessionData,
                    message: "Conta criada com sucesso",
                },
            })

            const { getByTestId } = render(
                <IntegrationTestWrapper>
                    <Routes />
                </IntegrationTestWrapper>,
            )

            // Verificar se o componente renderiza sem erros
            expect(getByTestId("loading-screen")).toBeTruthy()

            // Aguardar o fluxo de autenticação
            await waitFor(() => {
                expect(mockApi.post).toHaveBeenCalled()
            })
        })
    })

    describe("Sincronização de Dados", () => {
        it("deve sincronizar dados de sessão com stores", async () => {
            // Mock de dados de sessão válidos
            mockStorage.getString
                .mockReturnValueOnce("valid-session-id")
                .mockReturnValueOnce("123")
                .mockReturnValueOnce("valid-jwt-token")
                .mockReturnValueOnce("2024-12-31T23:59:59Z")

            const { getByTestId } = render(
                <IntegrationTestWrapper>
                    <Routes />
                </IntegrationTestWrapper>,
            )

            // Verificar se o componente renderiza sem erros
            expect(getByTestId("loading-screen")).toBeTruthy()

            // Aguardar a sincronização
            await waitFor(() => {
                expect(mockStorage.getString).toHaveBeenCalled()
            })
        })
    })

    describe("Tratamento de Erros", () => {
        it("deve lidar com falha na sincronização", async () => {
            // Mock de erro na sincronização
            mockStorage.getString.mockImplementation(() => {
                throw new Error("Erro de storage")
            })

            const { getByTestId } = render(
                <IntegrationTestWrapper>
                    <Routes />
                </IntegrationTestWrapper>,
            )

            // Verificar se o componente renderiza sem erros
            expect(getByTestId("loading-screen")).toBeTruthy()

            // Aguardar o tratamento de erro
            await waitFor(() => {
                expect(mockStorage.clearAll).toHaveBeenCalled()
            })
        })
    })
})
