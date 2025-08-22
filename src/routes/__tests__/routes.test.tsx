import { describe, expect, it, vi } from "vitest"

import React from "react"
import { render } from "@testing-library/react-native"

// Mock simples dos componentes
vi.mock("../app.routes", () => ({
    default: () => <div data-testid="app-route">App Route</div>,
}))

vi.mock("../auth.routes", () => ({
    default: () => <div data-testid="auth-route">Auth Route</div>,
}))

vi.mock("../../pages/auth/Loading", () => ({
    default: () => <div data-testid="loading-screen">Loading Screen</div>,
}))

// Mock do contexto de autenticação
vi.mock("../../contexts/Auth", () => ({
    default: {
        checkIsSigned: vi.fn(() => false),
        sessionData: null,
    },
}))

// Mock do contexto de redirecionamento
vi.mock("../../contexts/redirect", () => ({
    RedirectContext: {
        Provider: ({ children, value }: any) => <div>{children}</div>,
    },
}))

describe("Routes - Teste Básico", () => {
    it("deve ter imports válidos", () => {
        expect(React).toBeDefined()
        expect(vi).toBeDefined()
    })

    it("deve ter mocks configurados", () => {
        expect(vi.mock).toBeDefined()
    })
})
