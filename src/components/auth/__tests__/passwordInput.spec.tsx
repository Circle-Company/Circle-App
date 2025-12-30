import { act, fireEvent, render } from "@testing-library/react-native"
import React from "react"
import AuthContext from "../../../contexts/Auth"
import PasswordInput from "../passwordInput"

type MockAuthContextProps = {
    setSignInputPassword: jest.Mock
    signInputUsername: string
    errorMessage: string
    loading: boolean
}

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const authValues: MockAuthContextProps = {
        setSignInputPassword: jest.fn(),
        signInputUsername: "",
        errorMessage: "",
        loading: false,
    }
    return <AuthContext.Provider value={authValues as any}>{children}</AuthContext.Provider>
}

describe("PasswordInput Component", () => {
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
                <PasswordInput type="signUp" />
            </MockAuthProvider>
        )

        await act(async () => {
            jest.runAllTimers()
        })

        expect(getByTestId("password-input")).toBeTruthy()
        expect(queryByTestId("password-toggle-visibility")).toBeNull()
        expect(queryByTestId("password-toggle-clear")).toBeNull()

        // Dispara o evento de digitação com act
        await act(async () => {
            fireEvent.changeText(getByTestId("password-input"), "minhaSenha123")
            jest.runAllTimers()
        })

        // Espera que os botões tenham sido renderizados
        expect(getByTestId("password-toggle-visibility")).toBeTruthy()
        expect(getByTestId("password-toggle-clear")).toBeTruthy()
    })
})
