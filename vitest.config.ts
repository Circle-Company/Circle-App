import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
    test: {
        globals: true,
        environment: "happy-dom",
        setupFiles: ["./src/test-setup.ts"],
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        exclude: [
            "node_modules",
            "dist",
            ".git",
            ".cache",
            "**/coverage/**",
            "**/.nyc_output/**",
            "**/cypress/**",
            "**/test-results/**",
            "**/playwright-report/**",
            "**/android/**",
            "**/ios/**",
        ],
        testTransformMode: {
            web: [".ts", ".tsx"],
        },
        pool: "forks",
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
    },
    resolve: {
        // Forma de array porque a ordem importa: aliases string casam por
        // prefixo, então `@` sozinho engoliria `@env` e o resolveria como
        // `src/env`. O mais específico precisa vir primeiro.
        alias: [
            { find: /^@env$/, replacement: path.resolve(__dirname, "./__mocks__/env.ts") },
            { find: /^@\//, replacement: path.resolve(__dirname, "./src") + "/" },
            // `#/*` também aponta para `src/*` (ver tsconfig e babel.config).
            { find: /^#\//, replacement: path.resolve(__dirname, "./src") + "/" },
        ],
    },
    define: {
        __DEV__: true,
    },
})
