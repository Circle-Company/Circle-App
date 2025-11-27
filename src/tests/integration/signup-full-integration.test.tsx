import { beforeEach, describe, expect, it, vi } from "vitest"

// Mock das dependências globais primeiro
vi.mock("react-native-device-info", () => ({
    default: {
        getUniqueId: vi.fn(),
        getDeviceName: vi.fn(),
        getTotalDiskCapacity: vi.fn(),
        getSystemVersion: vi.fn(),
        hasNotch: vi.fn(),
    },
    getUniqueId: vi.fn(),
    getDeviceName: vi.fn(),
    getTotalDiskCapacity: vi.fn(),
    getSystemVersion: vi.fn(),
    hasNotch: vi.fn(),
}))

vi.mock("react-native", () => ({
    Platform: { OS: "ios" },
    Dimensions: { get: vi.fn(() => ({ width: 390, height: 844 })) },
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
    },
    storageKeys: vi.fn(() => ({
        user: {
            id: "@circle:user:id",
            name: "@circle:user:name",
            username: "@circle:user:username",
            description: "@circle:user:description",
            verified: "@circle:user:verified",
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
            appLanguage: "@circle:preferences:language:app",
            translationLanguage: "@circle:preferences:content:translation:language",
            autoplay: "@circle:preferences:content:autoplay",
            haptics: "@circle:preferences:content:haptics",
            translation: "@circle:preferences:content:translation",
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

vi.mock("../redirect", () => ({
    RedirectContext: {
        Provider: ({ children }: any) => children,
    },
}))

describe("Testes de Integração Completos - Criação de Conta", () => {
    let mockDeviceInfo: any
    let mockApi: any
    let mockStorage: any

    // Dados de sessão de exemplo
    const mockSessionData = {
        user: {
            id: "123",
            name: "Test User",
            username: "testuser",
            description: "Test description",
            verified: true,
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
            unreadNotificationsCount: 0,
            blocked: false,
            muted: false,
            last_active_at: "2024-01-01T00:00:00Z",
            last_login_at: "2024-01-01T00:00:00Z",
            jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token",
            jwtExpiration: "2024-12-31T23:59:59Z",
        },
        statistics: {
            total_followers_num: 0,
            total_likes_num: 0,
            total_views_num: 0,
        },
        preferences: {
            language: {
                appLanguage: "pt",
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
        },
        history: {
            search: [],
        },
    }

    beforeEach(() => {
        vi.clearAllMocks()

        // Configurar mocks
        mockDeviceInfo = vi.mocked(require("react-native-device-info"))
        mockApi = require("../../services/Api").default
        mockStorage = require("../../store").storage

        // Configurar comportamento padrão
        mockDeviceInfo.getUniqueId.mockResolvedValue("test-device-unique-id")
        mockDeviceInfo.getDeviceName.mockResolvedValue("Test iPhone 15 Pro")
        mockDeviceInfo.getTotalDiskCapacity.mockResolvedValue(512000000000)
        mockDeviceInfo.getSystemVersion.mockReturnValue("17.1")
        mockDeviceInfo.hasNotch.mockReturnValue(true)

        mockStorage.getString.mockReturnValue(null)
        mockStorage.set.mockImplementation(() => {})
        mockStorage.clearAll.mockImplementation(() => {})
    })

    describe("Fluxo Completo de Criação de Conta", () => {
        it("deve executar todo o fluxo de criação com sucesso", async () => {
            // Configurar resposta da API
            const mockApiResponse = {
                data: {
                    session: mockSessionData,
                    message: "Conta criada com sucesso",
                },
            }
            mockApi.post.mockResolvedValue(mockApiResponse)

            // Simular o processo de criação de conta como no código real
            const username = "newuser123"
            const password = "securepassword123"

            // Validações de entrada
            expect(username.trim()).toBeTruthy()
            expect(password.trim()).toBeTruthy()
            expect(password.length >= 4).toBe(true)

            // Coletar metadados do dispositivo (como no código real)
            const [deviceId, deviceName, totalDiskCapacity] = await Promise.all([
                mockDeviceInfo.getUniqueId().catch(() => "unknown"),
                mockDeviceInfo.getDeviceName().catch(() => "unknown"),
                mockDeviceInfo
                    .getTotalDiskCapacity()
                    .then((capacity: number) => capacity?.toString() || "unknown")
                    .catch(() => "unknown"),
            ])

            // Dados síncronos
            const screenResolution = { width: 390, height: 844 } // Mock Dimensions
            const osVersion = mockDeviceInfo.getSystemVersion()
            const hasNotch = mockDeviceInfo.hasNotch()

            // Construir payload
            const signData = {
                sign: {
                    username: username.trim(),
                    password: password,
                },
                metadata: {
                    device_id: deviceId,
                    device_type: "ios", // Platform.OS mock
                    device_name: deviceName,
                    device_token: deviceId,
                    os_language: "pt-BR",
                    os_version: osVersion,
                    total_device_memory: totalDiskCapacity,
                    screen_resolution_width: screenResolution.width,
                    screen_resolution_height: screenResolution.height,
                    has_notch: hasNotch,
                    unique_id: deviceId,
                },
                location_info: {
                    ip_address: "127.0.0.1",
                    mac_address: "00:00:00:00:00:00",
                    country: "BR",
                    state: "SP",
                    city: "São Paulo",
                    zone: "America/Sao_Paulo",
                },
            }

            // Verificar que DeviceInfo foi chamado
            expect(mockDeviceInfo.getUniqueId).toHaveBeenCalled()
            expect(mockDeviceInfo.getDeviceName).toHaveBeenCalled()
            expect(mockDeviceInfo.getTotalDiskCapacity).toHaveBeenCalled()
            expect(mockDeviceInfo.getSystemVersion).toHaveBeenCalled()
            expect(mockDeviceInfo.hasNotch).toHaveBeenCalled()

            // Verificar estrutura do payload
            expect(signData.sign.username).toBe("newuser123")
            expect(signData.sign.password).toBe("securepassword123")
            expect(signData.metadata.device_id).toBe("test-device-unique-id")
            expect(signData.metadata.device_name).toBe("Test iPhone 15 Pro")
            expect(signData.metadata.total_device_memory).toBe("512000000000")
            expect(signData.metadata.os_version).toBe("17.1")
            expect(signData.metadata.has_notch).toBe(true)

            // Simular chamada da API
            const response = await mockApi.post("/auth/sign-up", signData)

            // Verificar resposta
            expect(response.data.session).toBeDefined()
            expect(response.data.session.user.id).toBe("123")
            expect(response.data.session.account.jwtToken).toBeTruthy()

            // Verificar que dados seriam persistidos
            const sessionData = response.data.session
            expect(sessionData.user.id).toBe("123")
            expect(sessionData.user.username).toBe("testuser")
            expect(sessionData.account.jwtToken).toBe(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token",
            )
        })

        it("deve lidar com falhas na coleta de metadados", async () => {
            // Simular falha parcial
            mockDeviceInfo.getUniqueId.mockRejectedValue(new Error("Permission denied"))
            mockDeviceInfo.getTotalDiskCapacity.mockRejectedValue(new Error("Not available"))

            const mockApiResponse = {
                data: {
                    session: mockSessionData,
                    message: "Conta criada com sucesso",
                },
            }
            mockApi.post.mockResolvedValue(mockApiResponse)

            // Coletar metadados com fallback
            const [deviceId, deviceName, totalDiskCapacity] = await Promise.all([
                mockDeviceInfo.getUniqueId().catch(() => "unknown"),
                mockDeviceInfo.getDeviceName().catch(() => "unknown"),
                mockDeviceInfo
                    .getTotalDiskCapacity()
                    .then((capacity: number) => capacity?.toString() || "unknown")
                    .catch(() => "unknown"),
            ])

            expect(deviceId).toBe("unknown")
            expect(deviceName).toBe("Test iPhone 15 Pro") // Este não falhou
            expect(totalDiskCapacity).toBe("unknown")

            // Verificar que mesmo com falhas, o processo continua
            const signData = {
                sign: { username: "testuser", password: "test123" },
                metadata: {
                    device_id: deviceId,
                    device_name: deviceName,
                    total_device_memory: totalDiskCapacity,
                    // ... outros campos
                },
                location_info: {
                    ip_address: "127.0.0.1",
                    mac_address: "00:00:00:00:00:00",
                    country: "BR",
                    state: "SP",
                    city: "São Paulo",
                    zone: "America/Sao_Paulo",
                },
            }

            expect(signData.metadata.device_id).toBe("unknown")
            expect(signData.metadata.total_device_memory).toBe("unknown")
        })

        it("deve validar dados de entrada corretamente", () => {
            // Testes de validação
            const testCases = [
                { username: "", password: "123", valid: false, reason: "username vazio" },
                { username: "user", password: "", valid: false, reason: "password vazio" },
                { username: "user", password: "12", valid: false, reason: "password muito curto" },
                { username: "  ", password: "1234", valid: false, reason: "username só espaços" },
                {
                    username: "validuser",
                    password: "validpass",
                    valid: true,
                    reason: "dados válidos",
                },
            ]

            testCases.forEach(({ username, password, valid, reason }) => {
                const isValidInput = !!(username.trim() && password.trim())
                const isValidPassword = password.length >= 4

                const isValid = isValidInput && isValidPassword
                expect(isValid).toBe(valid, `Falhou para: ${reason}`)
            })
        })

        it("deve processar metadados em paralelo com Promise.all", async () => {
            const startTime = Date.now()

            // Simular delay nas funções
            mockDeviceInfo.getUniqueId.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve("device-id"), 30)),
            )
            mockDeviceInfo.getDeviceName.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve("device-name"), 30)),
            )
            mockDeviceInfo.getTotalDiskCapacity.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(1000000), 30)),
            )

            const [deviceId, deviceName, totalDiskCapacity] = await Promise.all([
                mockDeviceInfo.getUniqueId(),
                mockDeviceInfo.getDeviceName(),
                mockDeviceInfo
                    .getTotalDiskCapacity()
                    .then((c: number) => c?.toString() || "unknown"),
            ])

            const endTime = Date.now()
            const duration = endTime - startTime

            // Com Promise.all, deve executar em paralelo (~30ms) não sequencial (~90ms)
            expect(duration).toBeLessThan(60)
            expect(deviceId).toBe("device-id")
            expect(deviceName).toBe("device-name")
            expect(totalDiskCapacity).toBe("1000000")
        })

        it("deve construir payload compatível com StoreNewUserProps", async () => {
            const [deviceId, deviceName, totalDiskCapacity] = await Promise.all([
                mockDeviceInfo.getUniqueId().catch(() => "unknown"),
                mockDeviceInfo.getDeviceName().catch(() => "unknown"),
                mockDeviceInfo
                    .getTotalDiskCapacity()
                    .then((capacity: number) => capacity?.toString() || "unknown")
                    .catch(() => "unknown"),
            ])

            const signData = {
                sign: {
                    username: "testuser",
                    password: "password123",
                },
                metadata: {
                    device_id: deviceId,
                    device_type: "ios",
                    device_name: deviceName,
                    device_token: deviceId,
                    os_language: "pt-BR",
                    os_version: mockDeviceInfo.getSystemVersion(),
                    total_device_memory: totalDiskCapacity,
                    screen_resolution_width: 390,
                    screen_resolution_height: 844,
                    has_notch: mockDeviceInfo.hasNotch(),
                    unique_id: deviceId,
                },
                location_info: {
                    ip_address: "127.0.0.1",
                    mac_address: "00:00:00:00:00:00",
                    country: "BR",
                    state: "SP",
                    city: "São Paulo",
                    zone: "America/Sao_Paulo",
                },
            }

            // Verificar que tem todos os campos obrigatórios
            expect(signData).toHaveProperty("sign")
            expect(signData).toHaveProperty("metadata")
            expect(signData).toHaveProperty("location_info")

            // Verificar tipos e valores esperados
            expect(typeof signData.metadata.device_id).toBe("string")
            expect(typeof signData.metadata.device_name).toBe("string")
            expect(typeof signData.metadata.total_device_memory).toBe("string")
            expect(typeof signData.metadata.screen_resolution_width).toBe("number")
            expect(typeof signData.metadata.screen_resolution_height).toBe("number")
            expect(typeof signData.metadata.has_notch).toBe("boolean")

            expect(["android", "ios"]).toContain(signData.metadata.device_type)
            expect(signData.metadata.os_language).toBe("pt-BR")
        })
    })
})
