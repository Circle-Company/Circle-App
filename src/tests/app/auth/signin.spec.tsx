import AuthContext, { AuthContextsData } from "@/contexts/auth"
import { SessionDataType } from "@/contexts/Persisted/types"
import { NavigationContainer } from "@react-navigation/native"
import { act, fireEvent, render, waitFor } from "@testing-library/react-native"
import React from "react"
import SignInScreen from "./index"

const mockedColorScheme = jest.fn()
const mockedNavigate = jest.fn()

jest.mock("@/components/loading", () => ({
    Loading: {
        ActivityIndicator: () => null,
    },
}))

jest.mock("react-native/Libraries/Utilities/useColorScheme", () => ({
    ...jest.requireActual("react-native/Libraries/Utilities/useColorScheme"),
    default: mockedColorScheme,
}))

jest.mock("@react-navigation/native", () => {
    const actualNav = jest.requireActual("@react-navigation/native")
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
            goBack: jest.fn(),
        }),
    }
})

const mockAuthContext = (overrides = {}): AuthContextsData => ({
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    checkIsSigned: jest.fn(),
    getSessionData: jest.fn(),
    setSignInputUsername: jest.fn(),
    setSignInputPassword: jest.fn(),
    setErrorMessage: jest.fn(),
    signInputUsername: "",
    signInputPassword: "",
    loading: false,
    errorMessage: "",
    sessionData: {} as SessionDataType,
    ...overrides,
})

const renderWithProvider = (contextOverrides = {}) => {
    const contextValue = mockAuthContext(contextOverrides)

    const utils = render(
        <NavigationContainer>
            <AuthContext.Provider value={contextValue}>
                <SignInScreen />
            </AuthContext.Provider>
        </NavigationContainer>,
    )

    return { ...utils, contextValue }
}

describe("SignInScreen", () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })

    beforeEach(() => {
        mockedColorScheme.mockImplementation(() => "dark")
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

        await waitFor(() => {
            expect(getByTestId("title")).toBeTruthy()
            expect(getByTestId("inputs-container")).toBeTruthy()
            expect(getByTestId("handle-submit")).toBeTruthy()
            expect(getByTestId("auth-terms")).toBeTruthy()
        })
    })

    it("não chama signIn se os campos estiverem vazios", async () => {
        const { getByTestId, contextValue } = renderWithProvider()

        await act(async () => {
            fireEvent.press(getByTestId("handle-submit"))
            jest.runAllTimers()
        })

        expect(contextValue.signIn).not.toHaveBeenCalled()
    })

    it("chama signIn se os campos estiverem preenchidos e não estiver carregando", async () => {
        const { getByTestId, contextValue } = renderWithProvider({
            signInputUsername: "username",
            signInputPassword: "password",
            loading: false,
            errorMessage: "",
        })

        await act(async () => {
            fireEvent.press(getByTestId("handle-submit"))
            jest.runAllTimers()
        })

        expect(contextValue.signIn).toHaveBeenCalled()
    })

    it("não chama signIn se os campos estiverem preenchidos e carregando", async () => {
        const { getByTestId, contextValue } = renderWithProvider({
            signInputUsername: "username",
            signInputPassword: "password",
            loading: true,
            errorMessage: "",
        })

        await act(async () => {
            fireEvent.press(getByTestId("handle-submit"))
            jest.runAllTimers()
        })

        expect(contextValue.signIn).not.toHaveBeenCalled()
    })

    it("exibe mensagem de erro se errorMessage estiver presente", async () => {
        const { findByTestId } = renderWithProvider({
            errorMessage: "some error",
            signInputUsername: "username",
            signInputPassword: "password",
            loading: false,
        })

        await act(async () => {
            jest.runAllTimers()
        })

        const errorMessage = await findByTestId("error-container")
        expect(errorMessage).toBeTruthy()
    })
})
