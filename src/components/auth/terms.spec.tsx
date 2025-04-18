import AuthTermsText from "@/components/auth/terms"
import { useNavigation } from "@react-navigation/native"
import { act, fireEvent, render } from "@testing-library/react-native"
import React from "react"

jest.mock("@react-navigation/native", () => ({
    useNavigation: jest.fn(),
}))

describe("AuthTermsText", () => {
    const navigateMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate: navigateMock })
    })

    it("navigates to Privacy Policy on press", async () => {
        const { getByTestId } = render(<AuthTermsText signText="Sign In" />)
        const privacyButton = getByTestId("handle-privacy-policy")

        await act(async () => {
            fireEvent.press(privacyButton)
        })

        expect(navigateMock).toHaveBeenCalledWith("Auth-Privacy-Policy")
    })

    it("navigates to Terms of Service on press", async () => {
        const { getByTestId } = render(<AuthTermsText signText="Sign In" />)
        const termsButton = getByTestId("handle-terms-of-service")

        await act(async () => {
            fireEvent.press(termsButton)
        })

        expect(navigateMock).toHaveBeenCalledWith("Auth-Terms-Of-Service")
    })

    it("navigates to Community Guidelines on press", async () => {
        const { getByTestId } = render(<AuthTermsText signText="Sign In" />)
        const guidelinesButton = getByTestId("handle-community-guidelines")

        await act(async () => {
            fireEvent.press(guidelinesButton)
        })

        expect(navigateMock).toHaveBeenCalledWith("Auth-Community-Guidelines")
    })
})
