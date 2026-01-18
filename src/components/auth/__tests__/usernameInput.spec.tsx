import { act, fireEvent, render } from "@testing-library/react-native"
import React from "react"
import AuthContext from "../../../contexts/auth"
import UsernameInput from "../usernameInput"

type MockAuthContextProps = {
    setSignInputUsername: jest.Mock
    setSignInputPassword: jest.Mock
    signInputUsername: string
    errorMessage: string
    loading: boolean
}

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const authValues: MockAuthContextProps = {
        setSignInputUsername: jest.fn(),
        setSignInputPassword: jest.fn(),
        signInputUsername: "",
        errorMessage: "",
        loading: false,
    }
    return <AuthContext.Provider value={authValues as any}>{children}</AuthContext.Provider>
}

describe("UsernameInput Component", () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.clearAllTimers()
        jest.runOnlyPendingTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it("deve renderizar corretamente os botões de limpar e visibilidade após digitar a senha", async () => {
        const { getByTestId, queryByTestId } = render(
            <MockAuthProvider>
                <UsernameInput type="signUp" />
            </MockAuthProvider>,
        )

        await act(async () => {
            jest.runAllTimers()
        })

        expect(getByTestId("username-input")).toBeTruthy()
        expect(queryByTestId("username-toggle-clear")).toBeNull()

        await act(async () => {
            fireEvent.changeText(getByTestId("username-input"), "minhaSenha123")
            jest.runAllTimers()
        })

        // Espera que os botões tenham sido renderizados
        expect(getByTestId("username-toggle-clear")).toBeTruthy()
    })

    it("deve digitar um caractere inválido para username e retornar o input sem ele", async () => {
        const { getByTestId } = render(
            <MockAuthProvider>
                <UsernameInput type="signUp" />
            </MockAuthProvider>,
        )

        await act(async () => {
            jest.runAllTimers()
        })

        await act(async () => {
            fireEvent.changeText(getByTestId("username-input"), "minhaSenha123")
            jest.runAllTimers()
        })
    })
})
