// Filename: UsernameScreen.spec.tsx

import { useNavigation } from "@react-navigation/native"
import { act, fireEvent, render } from "@testing-library/react-native"
import React from "react"
import AuthContext, { AuthContextsData } from "../../../contexts/auth"
import UsernameScreen from "./Username"

const mockedColorScheme = jest.fn()
const mockedNavigate = jest.fn()

jest.mock("@react-navigation/native", () => ({
    useNavigation: jest.fn(),
}))

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
    ...jest.requireActual("react-native/Libraries/Utilities/useColorScheme"),
    default: mockedColorScheme,
}))

const mockAuthContext = (overrides = {}): Partial<AuthContextsData> => ({
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
    const contextValue = mockAuthContext(contextOverrides) as AuthContextsData

    const utils = render(
        <AuthContext.Provider value={contextValue}>
            <UsernameScreen />
        </AuthContext.Provider>,
    )

    return { ...utils, contextValue }
}

describe("UsernameScreen", () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })

    beforeEach(() => {
        mockedColorScheme.mockImplementation(() => "dark")
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate: mockedNavigate })
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.clearAllTimers()
        jest.runOnlyPendingTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it("renderiza os principais elementos da tela", async () => {
        const { getByTestId } = renderWithProvider()

        await act(async () => {
            jest.runAllTimers()
        })

        expect(getByTestId("header-container")).toBeTruthy()
        expect(getByTestId("header-title")).toBeTruthy()
        expect(getByTestId("input-container")).toBeTruthy()
    })

    it("não navega se o username estiver vazio", async () => {
        const { getByTestId } = renderWithProvider({
            signInputUsername: "",
        })

        await act(async () => {
            fireEvent.press(getByTestId("handle-submit"))
            jest.runAllTimers()
        })

        expect(mockedNavigate).not.toHaveBeenCalled()
    })

    it("navega se o username estiver preenchido e loading for falso", async () => {
        const { getByTestId } = renderWithProvider({
            signInputUsername: "usuario_teste",
            loading: false,
        })

        await act(async () => {
            fireEvent.press(getByTestId("handle-submit"))
            jest.runAllTimers()
        })

        expect(mockedNavigate).toHaveBeenCalledWith("Auth-SignUp-Password")
    })
})
