import { apiRoutes } from "../../services/Api"
import { refreshJwtToken } from "./useRefreshJwtToken"

// Mock dos módulos
jest.mock("react-native", () => ({
    AppState: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    },
}))

jest.mock("../../store", () => ({
    storage: {
        set: jest.fn(),
        getString: jest.fn(),
        delete: jest.fn(),
    },
    storageKeys: jest.fn(() => ({
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

jest.useFakeTimers() // Ativar fake timers para simular tempo
jest.mock("@/services/Api", () => ({
    apiRoutes: {
        auth: {
            refreshToken: jest.fn(() =>
                Promise.resolve({ data: { jwtToken: "newToken", jwtExpiration: 9999999999 } }),
            ),
        },
    },
}))

beforeAll(() => {
    jest.useFakeTimers()
})

afterAll(() => {
    jest.useRealTimers()
})

describe("refreshJwtToken", () => {
    let sessionAccountMock: any

    beforeEach(() => {
        jest.clearAllMocks()
        jest.clearAllTimers()
        sessionAccountMock = {
            setJwtToken: jest.fn(),
            setJwtExpiration: jest.fn(),
        }
    })

    it("deve chamar a API de refreshToken e atualizar sessionAccount", async () => {
        ;(apiRoutes.auth.refreshToken as jest.Mock).mockResolvedValueOnce({
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
