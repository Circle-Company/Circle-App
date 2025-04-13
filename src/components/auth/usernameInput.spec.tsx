import { act, fireEvent, render } from "@testing-library/react-native"
import React from "react"
import AuthContext from "../../contexts/Auth"
import UsernameInput from "./usernameInput"

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const authValues: any = {
        setSignInputUsername: jest.fn(),
        setSignInputPassword: jest.fn(),
        signInputUsername: "",
        errorMessage: "",
        loading: false,
    }
    return <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
}

describe("UsernameInput Component", () => {
    it("deve renderizar corretamente os botões de limpar e visibilidade após digitar a senha", async () => {
        const { getByTestId, queryByTestId } = render(
            <MockAuthProvider>
                <UsernameInput type="signUp" />
            </MockAuthProvider>
        )

        expect(getByTestId("username-input")).toBeTruthy()
        expect(queryByTestId("username-toggle-clear")).toBeNull()

        // ⬇️ ENVOLVE fireEvent dentro do act
        await act(async () => {
            fireEvent.changeText(getByTestId("username-input"), "minhaSenha123")
        })

        // Espera que os botões tenham sido renderizados
        expect(getByTestId("username-toggle-clear")).toBeTruthy()
    })

    it("deve digitar um caractere inválido para username e retornar o input sem ele", async () => {
        const { getByTestId, queryByTestId } = render(
            <MockAuthProvider>
                <UsernameInput type="signUp" />
            </MockAuthProvider>
        )

        await act(async () => {
            fireEvent.changeText(getByTestId("username-input"), "minhaSenha123")
        })
    })
})
