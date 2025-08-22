import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import { apiRoutes } from "../../services/Api"
import { refreshJwtToken } from "./useRefreshJwtToken"

// Mock dos módulos
vi.mock("react-native", () => ({
    AppState: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    },
}))

vi.mock("../../store", () => ({
    storage: {
        set: vi.fn(),
        getString: vi.fn(),
        delete: vi.fn(),
    },
    storageKeys: vi.fn(() => ({
        account: {
            jwt: {
                expiration: "account.jwt.expiration",
            },
        },
        user: {
            username: "user.username",
            id: "user.id",
        },
    })),
}))

vi.useFakeTimers() // Ativar fake timers para simular tempo
vi.mock("@/services/Api", () => ({
    apiRoutes: {
        auth: {
            refreshToken: vi.fn(() =>
                Promise.resolve({ data: { jwtToken: "newToken", jwtExpiration: 9999999999 } }),
            ),
        },
    },
}))

beforeAll(() => {
    vi.useFakeTimers()
})

afterAll(() => {
    vi.useRealTimers()
})

describe("refreshJwtToken", () => {
    let sessionAccountMock: any

    beforeEach(() => {
        vi.clearAllMocks()
        vi.clearAllTimers()
        sessionAccountMock = {
            setJwtToken: vi.fn(),
            setJwtExpiration: vi.fn(),
        }
    })

    it("deve chamar a API de refreshToken e atualizar sessionAccount", async () => {
        ;(apiRoutes.auth.refreshToken as any).mockResolvedValueOnce({
            data: {
                jwtToken: "novaJWT",
                jwtExpiration: "9999999999",
            },
        })

        await refreshJwtToken({ username: "testUser", id: "123" }, sessionAccountMock)

        expect(apiRoutes.auth.refreshToken).toHaveBeenCalledWith({
            username: "testUser",
            id: "123",
        })
        expect(sessionAccountMock.setJwtToken).toHaveBeenCalledWith("novaJWT")
        expect(sessionAccountMock.setJwtExpiration).toHaveBeenCalledWith("9999999999")
    })
})
