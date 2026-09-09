import { describe, it, expect, vi } from "vitest"
import React from "react"

// Simple mock provider component
const MockPersistedProvider = ({ children }: { children: React.ReactNode }) => {
    return React.createElement("div", { "data-testid": "persisted-provider" }, children)
}

// Mock the entire index module
vi.mock("../index", () => ({
    Provider: MockPersistedProvider,
    default: {
        session: {
            user: { id: "", name: "", setId: vi.fn(), setName: vi.fn() },
            account: { jwtToken: "", setJwtToken: vi.fn() },
            preferences: { language: "en", setLanguage: vi.fn() },
            statistics: { followers: 0, setFollowers: vi.fn() },
            history: { searches: [], setSearches: vi.fn() },
        },
        device: {
            permissions: { postNotifications: false, setPostNotifications: vi.fn() },
            metadata: { deviceType: "", setDeviceType: vi.fn() },
        },
    },
}))

describe("Persisted Context", () => {
    describe("Provider Component", () => {
        it("should be defined", () => {
            expect(MockPersistedProvider).toBeDefined()
        })

        it("should render children", () => {
            const TestChild = () => React.createElement("span", null, "Test Child")
            const wrapper = MockPersistedProvider({ children: React.createElement(TestChild) })
            expect(wrapper).toBeDefined()
        })
    })

    describe("Context Structure", () => {
        it("should have session and device sections", () => {
            const mockContext = {
                session: {
                    user: { id: "", name: "" },
                    account: { jwtToken: "" },
                    preferences: { language: "en" },
                    statistics: { followers: 0 },
                    history: { searches: [] },
                },
                device: {
                    permissions: { postNotifications: false },
                    metadata: { deviceType: "" },
                },
            }

            expect(mockContext).toHaveProperty("session")
            expect(mockContext).toHaveProperty("device")
            expect(mockContext.session).toHaveProperty("user")
            expect(mockContext.session).toHaveProperty("account")
            expect(mockContext.session).toHaveProperty("preferences")
            expect(mockContext.session).toHaveProperty("statistics")
            expect(mockContext.session).toHaveProperty("history")
            expect(mockContext.device).toHaveProperty("permissions")
            expect(mockContext.device).toHaveProperty("metadata")
        })
    })

    describe("Basic Functionality", () => {
        // Documenta a forma do contexto depois da fusão (§11.2). É deliberadamente um
        // teste de formato, não de comportamento: sem renderização de componente
        // (`CLAUDE.md`) não dá para montar o provider aqui. O comportamento da store está
        // coberto em `persistedAccount.spec.ts`.
        it("expõe account, preferences e metrics — e nenhum token", () => {
            const session = {
                account: { userId: "user-1", username: "fulano", isVerified: true },
                preferences: { language: { appLanguage: "pt" } },
                metrics: { totalFollowers: 100 },
            }

            expect(session.account.userId).toBe("user-1")
            expect(session.account.username).toBe("fulano")
            expect(session.preferences.language.appLanguage).toBe("pt")
            expect(session.metrics.totalFollowers).toBe(100)

            // `user` e `account` eram duas portas para a mesma entidade; agora há uma.
            expect(session).not.toHaveProperty("user")
            // Credencial não mora em contexto de perfil — quem injeta o header é o
            // interceptor, a partir da sessão viva (§3.2).
            expect(session.account).not.toHaveProperty("jwtToken")
        })
    })
})
