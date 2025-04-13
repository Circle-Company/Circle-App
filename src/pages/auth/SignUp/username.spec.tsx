// Filename: UsernameScreen.spec.tsx

import AuthContext from "@/contexts/Auth"
import { useNavigation } from "@react-navigation/native"
import { fireEvent, render } from "@testing-library/react-native"
import React from "react"
import UsernameScreen from "./Username"
const mockedColorScheme = jest.fn()

jest.mock("@react-navigation/native", () => ({
    useNavigation: jest.fn(),
}))

// Mock de useColorScheme
jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
    ...jest.requireActual("react-native/Libraries/Utilities/useColorScheme"),
    useColorScheme: mockedColorScheme,
}))
// Mock do contexto de autenticação
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
            <UsernameScreen />
        </AuthContext.Provider>
    )

    return { ...utils, contextValue }
}

describe("UsernameScreen", () => {
    mockedColorScheme.mockImplementationOnce(() => "dark")
    const navigateMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateMock })
    })

    it("renderiza os principais elementos da tela", () => {
        const { getByTestId } = renderWithProvider()

        expect(getByTestId("header-container")).toBeTruthy()
        expect(getByTestId("header-title")).toBeTruthy()
        expect(getByTestId("input-container")).toBeTruthy()
    })

    it("não navega se o username estiver vazio", () => {
        const { getByTestId } = renderWithProvider({
            signInputUsername: "",
        })

        fireEvent.press(getByTestId("handle-submit"))

        expect(navigateMock).not.toHaveBeenCalled()
    })

    it("navega se o username estiver preenchido e loading for falso", () => {
        const { getByTestId } = renderWithProvider({
            signInputUsername: "usuario_teste",
            loading: false,
        })

        fireEvent.press(getByTestId("handle-submit"))

        expect(navigateMock).toHaveBeenCalledWith("Auth-SignUp-Password")
    })
})
