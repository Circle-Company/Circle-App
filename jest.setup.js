/* global jest */
import "@testing-library/jest-native/extend-expect"
import "react-native-gesture-handler/jestSetup"

// Mock das animações para evitar erro em transições de telas
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper")

jest.mock("react-native-keyboard-controller", () => ({
    KeyboardProvider: ({ children }) => children,
}))

// Mock de navegação caso use React Navigation
jest.mock("@react-navigation/native", () => ({
    useNavigation: () => ({ navigate: jest.fn() }),
}))

module.exports = async () => {
    jest.useRealTimers()
    jest.clearAllTimers()
}
