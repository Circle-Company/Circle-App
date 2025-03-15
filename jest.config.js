module.exports = {
    preset: "react-native",
    testEnvironment: "node",
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest", // Garante suporte a TSX/JSX
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "@testing-library/jest-native/extend-expect"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    collectCoverage: false,
    collectCoverageFrom: ["src/**/*.{ts,tsx}"],
    coverageDirectory: "coverage",
    clearMocks: true,
}
