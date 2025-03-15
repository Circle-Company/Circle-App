import { apiRoutes } from "../../services/Api"
import { monitorJwtExpiration, refreshJwtToken } from "./jwtManager"

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
jest.mock("../../services/Api", () => ({
    apiRoutes: {
        auth: {
            refreshToken: jest.fn(() =>
                Promise.resolve({ data: { jwtToken: "newToken", jwtExpiration: 9999999999 } })
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

describe("monitorJwtExpiration", () => {
    let refreshJwtTokenMock: jest.Mock
    let sessionAccountMock: any
    let appStateListener: (state: string) => void

    beforeEach(() => {
        jest.useFakeTimers()
        jest.clearAllMocks()
        jest.clearAllTimers()
        refreshJwtTokenMock = jest.fn()
        sessionAccountMock = { jwtExpiration: Date.now() / 1000 + 120 }
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.clearAllTimers()
    })

    it("deve agendar um timeout para renovar o token antes da expiração", () => {
        monitorJwtExpiration(sessionAccountMock, refreshJwtTokenMock)

        jest.advanceTimersByTime(61 * 1000)
        jest.runOnlyPendingTimers()
        expect(refreshJwtTokenMock).not.toHaveBeenCalled()

        jest.advanceTimersByTime(61 * 1000)
        jest.runOnlyPendingTimers()
        expect(refreshJwtTokenMock).toHaveBeenCalledTimes(1)
    })

    it("deve chamar a renovação imediatamente se estiver muito próximo de expirar", () => {
        sessionAccountMock.jwtExpiration = Date.now() / 1000 + 10
        monitorJwtExpiration(sessionAccountMock, refreshJwtTokenMock)

        expect(refreshJwtTokenMock).toHaveBeenCalledTimes(1)
    })

    it("deve chamar a renovação ao voltar para o estado ativo", () => {
        monitorJwtExpiration(sessionAccountMock, refreshJwtTokenMock)

        appStateListener("active")

        expect(refreshJwtTokenMock).toHaveBeenCalledTimes(1)
    })
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

    it("não deve chamar a API se username ou id estiver vazio", async () => {
        await refreshJwtToken({ username: "", id: "" }, sessionAccountMock)
        expect(apiRoutes.auth.refreshToken).not.toHaveBeenCalled()
    })

    it("deve capturar erro se a API falhar", async () => {
        ;(apiRoutes.auth.refreshToken as jest.Mock).mockRejectedValueOnce(new Error("API Error"))

        await expect(
            refreshJwtToken({ username: "testUser", id: "123" }, sessionAccountMock)
        ).rejects.toThrow("API Error")

        expect(apiRoutes.auth.refreshToken).toHaveBeenCalled()
    })
})
