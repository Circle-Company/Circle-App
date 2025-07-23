module.exports = {
    preset: "react-native",
    testEnvironment: "node",
    transformIgnorePatterns: [
        "node_modules/(?!(react-native|@react-native|react-native-svg)/)",
        "node_modules/(?!react-native|react-native-reanimated|@react-native|@react-navigation|@motify/.*)",
        "node_modules/(?!(react-native" +
            "|@react-native" +
            "|react-native-reanimated" +
            "|@motify" + // ⬅️ Moti usa @motify
            ")/)",
    ],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Garante suporte a TSX/JSX
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "@testing-library/jest-native/extend-expect"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "\\.svg$": "<rootDir>/__mocks__/svgMock.js",
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    reporters: ["jest-silent-reporter"],
    collectCoverage: false,
    collectCoverageFrom: ["src/**/*.{ts,tsx}"],
    coverageDirectory: "coverage",
    clearMocks: true,
}
