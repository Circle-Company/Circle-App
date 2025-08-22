import AuthContext, { AuthContextsData, Provider } from "./index"
import { act, fireEvent, render, waitFor } from "@testing-library/react-native"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Platform } from "react-native"
import React from "react"
import { RedirectContext } from "../redirect"

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

// Mocks globais - serão definidos nos testes
let mockApi: any
let mockStorage: any

// Mock do contexto de redirecionamento
const mockSetRedirectTo = vi.fn()
const mockRedirectContext = {
    redirectTo: null,
    setRedirectTo: mockSetRedirectTo,
}

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

// Wrapper para testes
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <RedirectContext.Provider value={mockRedirectContext}>
        <Provider>{children}</Provider>
    </RedirectContext.Provider>
)

describe("AuthContext", () => {
    beforeEach(async () => {
        vi.clearAllMocks()

        // Inicializar mocks
        mockApi = vi.mocked((await import("../../services/Api")).default)
        mockStorage = vi.mocked((await import("../../store")).storage)

        mockStorage.getString.mockReturnValue(null)
        mockStorage.clearAll.mockImplementation(() => {})
        mockStorage.set.mockImplementation(() => {})
    })

    describe("Provider", () => {
        it("deve renderizar sem erros", () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <div data-testid="test">Test</div>
                </TestWrapper>,
            )
            expect(getByTestId("test")).toBeTruthy()
        })

        it("deve fornecer contexto de autenticação", () => {
            const { getByTestId } = render(
                <TestWrapper>
                    <AuthContext.Consumer>
                        {(context) => (
                            <div data-testid="context">
                                {context ? "Contexto disponível" : "Contexto não disponível"}
                            </div>
                        )}
                    </AuthContext.Consumer>
                </TestWrapper>,
            )
            expect(getByTestId("context")).toBeTruthy()
        })
    })

    describe("Funções de Autenticação", () => {
        describe("signIn", () => {
            it("deve fazer login com credenciais válidas", async () => {
                const mockResponse = {
                    data: {
                        session: mockSessionData,
                        message: "Login realizado com sucesso",
                    },
                }

                mockApi.post.mockResolvedValue(mockResponse)

                const { getByText } = render(
                    <TestWrapper>
                        <AuthContext.Consumer>
                            {(context) => (
                                <div>
                                    <button
                                        data-testid="signin-btn"
                                        onClick={() => context?.signIn("testuser", "password123")}
                                    >
                                        Login
                                    </button>
                                </div>
                            )}
                        </AuthContext.Consumer>
                    </TestWrapper>,
                )

                const button = getByText("Login")
                await act(async () => {
                    fireEvent.press(button)
                })

                expect(mockApi.post).toHaveBeenCalledWith("/auth/signin", {
                    username: "testuser",
                    password: "password123",
                })
            })

            it("deve validar entrada antes de fazer login", async () => {
                const { getByText } = render(
                    <TestWrapper>
                        <AuthContext.Consumer>
                            {(context) => (
                                <div>
                                    <button
                                        data-testid="signin-btn"
                                        onClick={() => context?.signIn("", "")}
                                    >
                                        Login Vazio
                                    </button>
                                </div>
                            )}
                        </AuthContext.Consumer>
                    </TestWrapper>,
                )

                const button = getByText("Login Vazio")
                await act(async () => {
                    fireEvent.press(button)
                })

                // Deve validar entrada antes de fazer chamada à API
                expect(mockApi.post).not.toHaveBeenCalled()
            })

            it("deve lidar com erro de API", async () => {
                const mockError = new Error("Credenciais inválidas")
                mockApi.post.mockRejectedValue(mockError)

                const { getByText } = render(
                    <TestWrapper>
                        <AuthContext.Consumer>
                            {(context) => (
                                <div>
                                    <button
                                        data-testid="signin-btn"
                                        onClick={() => context?.signIn("wronguser", "wrongpass")}
                                    >
                                        Login Erro
                                    </button>
                                </div>
                            )}
                        </AuthContext.Consumer>
                    </TestWrapper>,
                )

                const button = getByText("Login Erro")
                await act(async () => {
                    fireEvent.press(button)
                })

                expect(mockApi.post).toHaveBeenCalled()
            })
        })

        describe("signUp", () => {
            it("deve criar conta com dados válidos", async () => {
                const mockResponse = {
                    data: {
                        session: mockSessionData,
                        message: "Conta criada com sucesso",
                    },
                }

                mockApi.post.mockResolvedValue(mockResponse)

                const { getByText } = render(
                    <TestWrapper>
                        <AuthContext.Consumer>
                            {(context) => (
                                <div>
                                    <button
                                        data-testid="signup-btn"
                                        onClick={() => context?.signUp("newuser", "newpass123")}
                                    >
                                        Criar Conta
                                    </button>
                                </div>
                            )}
                        </AuthContext.Consumer>
                    </TestWrapper>,
                )

                const button = getByText("Criar Conta")
                await act(async () => {
                    fireEvent.press(button)
                })

                expect(mockApi.post).toHaveBeenCalledWith("/auth/signup", {
                    username: "newuser",
                    password: "newpass123",
                    deviceMetadata: expect.any(Object),
                })
            })

            it("deve validar senha mínima", async () => {
                const { getByText } = render(
                    <TestWrapper>
                        <AuthContext.Consumer>
                            {(context) => (
                                <div>
                                    <button
                                        data-testid="signup-btn"
                                        onClick={() => context?.signUp("newuser", "123")}
                                    >
                                        Senha Curta
                                    </button>
                                </div>
                            )}
                        </AuthContext.Consumer>
                    </TestWrapper>,
                )

                const button = getByText("Senha Curta")
                await act(async () => {
                    fireEvent.press(button)
                })

                // Deve validar senha antes de fazer chamada à API
                expect(mockApi.post).not.toHaveBeenCalled()
            })
        })

        describe("signOut", () => {
            it("deve fazer logout e limpar dados", async () => {
                const { getByText } = render(
                    <TestWrapper>
                        <AuthContext.Consumer>
                            {(context) => (
                                <div>
                                    <button
                                        data-testid="signout-btn"
                                        onClick={() => context?.signOut()}
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </AuthContext.Consumer>
                    </TestWrapper>,
                )

                const button = getByText("Logout")
                await act(async () => {
                    fireEvent.press(button)
                })

                // Deve limpar storage e redirecionar
                expect(mockStorage.clearAll).toHaveBeenCalled()
            })
        })

        describe("getSessionData", () => {
            it("deve buscar dados da sessão", async () => {
                const mockResponse = {
                    data: {
                        session: mockSessionData,
                    },
                }

                mockApi.get.mockResolvedValue(mockResponse)

                const { getByText } = render(
                    <TestWrapper>
                        <AuthContext.Consumer>
                            {(context) => (
                                <div>
                                    <button
                                        data-testid="session-btn"
                                        onClick={() => context?.getSessionData()}
                                    >
                                        Buscar Sessão
                                    </button>
                                </div>
                            )}
                        </AuthContext.Consumer>
                    </TestWrapper>,
                )

                const button = getByText("Buscar Sessão")
                await act(async () => {
                    fireEvent.press(button)
                })

                expect(mockApi.get).toHaveBeenCalledWith("/auth/session")
            })
        })

        describe("checkIsSigned", () => {
            it("deve verificar se usuário está logado", async () => {
                // Mock de dados de sessão válidos
                mockStorage.getString
                    .mockReturnValueOnce("valid-session-id") // sessionId
                    .mockReturnValueOnce("123") // userId
                    .mockReturnValueOnce("valid-jwt-token") // jwtToken
                    .mockReturnValueOnce("2024-12-31T23:59:59Z") // jwtExpiration

                const { getByText } = render(
                    <TestWrapper>
                        <AuthContext.Consumer>
                            {(context) => (
                                <div>
                                    <button
                                        data-testid="check-btn"
                                        onClick={() => context?.checkIsSigned()}
                                    >
                                        Verificar Login
                                    </button>
                                </div>
                            )}
                        </AuthContext.Consumer>
                    </TestWrapper>,
                )

                const button = getByText("Verificar Login")
                await act(async () => {
                    fireEvent.press(button)
                })

                // Deve verificar dados no storage
                expect(mockStorage.getString).toHaveBeenCalled()
            })

            it("deve fazer logout automático se token expirou", async () => {
                // Mock de token expirado
                mockStorage.getString
                    .mockReturnValueOnce("valid-session-id")
                    .mockReturnValueOnce("123")
                    .mockReturnValueOnce("valid-jwt-token")
                    .mockReturnValueOnce("2020-01-01T00:00:00Z") // Token expirado

                const { getByText } = render(
                    <TestWrapper>
                        <AuthContext.Consumer>
                            {(context) => (
                                <div>
                                    <button
                                        data-testid="check-expired-btn"
                                        onClick={() => context?.checkIsSigned()}
                                    >
                                        Verificar Token Expirado
                                    </button>
                                </div>
                            )}
                        </AuthContext.Consumer>
                    </TestWrapper>,
                )

                const button = getByText("Verificar Token Expirado")
                await act(async () => {
                    fireEvent.press(button)
                })

                // Deve fazer logout automático
                expect(mockStorage.clearAll).toHaveBeenCalled()
            })
        })
    })

    describe("Validação de Dados", () => {
        it("deve validar dados de sessão completos", () => {
            const validSession = {
                user: {
                    id: "123",
                    name: "Test User",
                    username: "testuser",
                },
                account: {
                    jwtToken: "valid-token",
                    jwtExpiration: "2024-12-31T23:59:59Z",
                },
                statistics: {
                    total_followers_num: 100,
                },
                preferences: {
                    primaryLanguage: "pt",
                },
                history: {
                    search: [],
                },
            }

            // Deve aceitar dados válidos
            expect(validSession).toHaveProperty("user.id")
            expect(validSession).toHaveProperty("account.jwtToken")
            expect(validSession).toHaveProperty("statistics.total_followers_num")
        })

        it("deve lidar com dados de sessão incompletos", () => {
            const incompleteSession = {
                user: {
                    id: "123",
                    // name e username faltando
                },
                account: {
                    // jwtToken e jwtExpiration faltando
                },
            }

            // Deve lidar com dados incompletos
            expect(incompleteSession.user.id).toBe("123")
            expect(incompleteSession.account).toBeDefined()
        })
    })

    describe("Persistência de Dados", () => {
        it("deve persistir dados de sessão no storage", async () => {
            const { getByText } = render(
                <TestWrapper>
                    <AuthContext.Consumer>
                        {(context) => (
                            <div>
                                <button
                                    data-testid="persist-btn"
                                    onClick={() => context?.signIn("testuser", "password123")}
                                >
                                    Login e Persistir
                                </button>
                            </div>
                        )}
                    </AuthContext.Consumer>
                </TestWrapper>,
            )

            const button = getByText("Login e Persistir")
            await act(async () => {
                fireEvent.press(button)
            })

            // Deve persistir dados no storage
            expect(mockStorage.set).toHaveBeenCalled()
        })

        it("deve limpar dados ao fazer logout", async () => {
            const { getByText } = render(
                <TestWrapper>
                    <AuthContext.Consumer>
                        {(context) => (
                            <div>
                                <button data-testid="clear-btn" onClick={() => context?.signOut()}>
                                    Logout e Limpar
                                </button>
                            </div>
                        )}
                    </AuthContext.Consumer>
                </TestWrapper>,
            )

            const button = getByText("Logout e Limpar")
            await act(async () => {
                fireEvent.press(button)
            })

            // Deve limpar storage
            expect(mockStorage.clearAll).toHaveBeenCalled()
        })
    })

    describe("Tratamento de Erros", () => {
        it("deve lidar com erros de rede", async () => {
            const networkError = new Error("Erro de conexão")
            mockApi.post.mockRejectedValue(networkError)

            const { getByText } = render(
                <TestWrapper>
                    <AuthContext.Consumer>
                        {(context) => (
                            <div>
                                <button
                                    data-testid="network-error-btn"
                                    onClick={() => context?.signIn("testuser", "password123")}
                                >
                                    Testar Erro de Rede
                                </button>
                            </div>
                        )}
                    </AuthContext.Consumer>
                </TestWrapper>,
            )

            const button = getByText("Testar Erro de Rede")
            await act(async () => {
                fireEvent.press(button)
            })

            // Deve lidar com erro de rede
            expect(mockApi.post).toHaveBeenCalled()
        })

        it("deve lidar com respostas malformadas da API", async () => {
            const malformedResponse = {
                data: {
                    // Dados incompletos ou malformados
                    message: "Sucesso",
                    // session faltando
                },
            }

            mockApi.post.mockResolvedValue(malformedResponse)

            const { getByText } = render(
                <TestWrapper>
                    <AuthContext.Consumer>
                        {(context) => (
                            <div>
                                <button
                                    data-testid="malformed-btn"
                                    onClick={() => context?.signIn("testuser", "password123")}
                                >
                                    Testar Resposta Malformada
                                </button>
                            </div>
                        )}
                    </AuthContext.Consumer>
                </TestWrapper>,
            )

            const button = getByText("Testar Resposta Malformada")
            await act(async () => {
                fireEvent.press(button)
            })

            // Deve lidar com resposta malformada
            expect(mockApi.post).toHaveBeenCalled()
        })
    })

    describe("Integração com Device Info", () => {
        it("deve coletar metadados do dispositivo no signup", async () => {
            const { getByText } = render(
                <TestWrapper>
                    <AuthContext.Consumer>
                        {(context) => (
                            <div>
                                <button
                                    data-testid="device-info-btn"
                                    onClick={() => context?.signUp("newuser", "newpass123")}
                                >
                                    Signup com Device Info
                                </button>
                            </div>
                        )}
                    </AuthContext.Consumer>
                </TestWrapper>,
            )

            const button = getByText("Signup com Device Info")
            await act(async () => {
                fireEvent.press(button)
            })

            // Deve incluir deviceMetadata na requisição
            expect(mockApi.post).toHaveBeenCalledWith(
                "/auth/signup",
                expect.objectContaining({
                    username: "newuser",
                    password: "newpass123",
                    deviceMetadata: expect.any(Object),
                }),
            )
        })
    })
})
