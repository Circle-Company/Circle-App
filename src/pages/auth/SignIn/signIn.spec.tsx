import AuthContext from "@/contexts/Auth"
import { fireEvent, render } from "@testing-library/react-native"
import React from "react"
import SignInScreen from "./index"
const mockedColorScheme = jest.fn()

jest.mock("@/components/loading", () => ({
    Loading: {
        ActivityIndicator: () => null,
    },
}))
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
    ...jest.requireActual("react-native/Libraries/Utilities/useColorScheme"),
    useColorScheme: mockedColorScheme,
}))

const mockAuthContext = (overrides = {}) => ({
    signIn: jest.fn(),
    setSignInputUsername: jest.fn(),
    setSignInputPassword: jest.fn(),
    setErrorMessage: jest.fn(),
    signInputUsername: "",
    signInputPassword: "",
    loading: false,
    errorMessage: "",
    ...overrides,
})

const renderWithProvider = (contextOverrides = {}) => {
    const contextValue: any = mockAuthContext(contextOverrides)

    const utils = render(
        <AuthContext.Provider value={contextValue}>
            <SignInScreen />
        </AuthContext.Provider>
    )

    return { ...utils, contextValue }
}

describe("SignInScreen", () => {
    mockedColorScheme.mockImplementationOnce(() => "dark")
    it("renderiza os principais elementos da tela", () => {
        const { getByTestId } = renderWithProvider()

        expect(getByTestId("title")).toBeTruthy()
        expect(getByTestId("inputs-container")).toBeTruthy()
        expect(getByTestId("handle-submit")).toBeTruthy()
        expect(getByTestId("auth-terms")).toBeTruthy()
    })

    it("não chama signIn se os campos estiverem vazios", () => {
        const { getByTestId, contextValue } = renderWithProvider({
            signInputUsername: "",
            signInputPassword: "",
            loading: false,
            errorMessage: "",
        })

        fireEvent.press(getByTestId("handle-submit"))

        expect(contextValue.signIn).not.toHaveBeenCalled()
    })

    it("chama signIn se os campos estiverem preenchidos e não estiver carregando", () => {
        const { getByTestId, contextValue } = renderWithProvider({
            signInputUsername: "username",
            signInputPassword: "password",
            loading: false,
            errorMessage: "",
        })

        fireEvent.press(getByTestId("handle-submit"))
        expect(contextValue.signIn).toHaveBeenCalled()
    })

    it("não chama signIn se os campos estiverem preenchidos e carregando", () => {
        const { getByTestId, contextValue } = renderWithProvider({
            signInputUsername: "username",
            signInputPassword: "password",
            loading: true,
            errorMessage: "",
        })

        fireEvent.press(getByTestId("handle-submit"))
        expect(contextValue.signIn).not.toHaveBeenCalled()
    })

    it("exibe mensagem de erro se errorMessage estiver presente", async () => {
        const { findByTestId } = renderWithProvider({
            errorMessage: "some error",
            signInputUsername: "username",
            signInputPassword: "password",
            loading: false,
        })

        const errorMessage = await findByTestId("error-container")
        expect(errorMessage).toBeTruthy()
    })
})
