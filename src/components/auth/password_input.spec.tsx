import { act, fireEvent, render } from "@testing-library/react-native"
import React from "react"
import AuthContext from "../../contexts/Auth"
import PasswordInput from "./password_input"

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
    const authValues: any = {
        setSignInputPassword: jest.fn(),
        signInputUsername: "",
        errorMessage: "",
        loading: false,
    }
    return <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
}

describe("PasswordInput Component", () => {
    it("deve renderizar corretamente os botões de limpar e visibilidade após digitar a senha", async () => {
        const { getByTestId, queryByTestId } = render(
            <MockAuthProvider>
                <PasswordInput type="signUp" />
            </MockAuthProvider>
        )

        expect(getByTestId("password-container")).toBeTruthy()
        expect(getByTestId("password-input")).toBeTruthy()
        expect(queryByTestId("password-toggle-visibility")).toBeNull()
        expect(queryByTestId("password-toggle-clear")).toBeNull()

        // ⬇️ ENVOLVE fireEvent dentro do act
        await act(async () => {
            fireEvent.changeText(getByTestId("password-input"), "minhaSenha123")
        })

        // Espera que os botões tenham sido renderizados
        expect(getByTestId("password-toggle-visibility")).toBeTruthy()
        expect(getByTestId("password-toggle-clear")).toBeTruthy()
    })
})
