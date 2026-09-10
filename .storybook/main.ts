import path from "node:path"
import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/react-native-web-vite"

// O Storybook carrega este arquivo como ESM, onde `__dirname` não existe.
const configDir = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(configDir, "..")

/**
 * Storybook **web** — abre no navegador, sem subir o app nem o dev build.
 *
 * Roda os componentes por `react-native-web`. O que é view nativa
 * (`@expo/ui`, MMKV, file-system) entra por stub em `./mocks`: o objetivo aqui é
 * iterar em layout, tema e estados, não validar a camada nativa — isso continua
 * sendo papel do Storybook on-device (`npm run storybook:ios`), que compartilha
 * as mesmas stories.
 */
const main: StorybookConfig = {
    stories: ["../src/components/chat/**/*.stories.?(ts|tsx|js|jsx)"],
    addons: [],
    // Serve o Inter em /fonts, consumido pelos @font-face do preview-head.html.
    staticDirs: [{ from: "../assets/fonts/inter", to: "/fonts" }],
    framework: {
        name: "@storybook/react-native-web-vite",
        options: {},
    },
    viteFinal: async (config) => {
        config.resolve = config.resolve ?? {}
        // Forma de array porque alias de string casa por prefixo: `@` sozinho
        // engoliria `@env` e `@expo/...`. O mais específico vem primeiro — mesma
        // ordem do `vitest.config.ts`.
        config.resolve.alias = [
            ...(Array.isArray(config.resolve.alias) ? config.resolve.alias : []),
            { find: /^@env$/, replacement: path.resolve(root, "__mocks__/env.ts") },
            {
                find: /^@expo\/ui\/swift-ui\/modifiers$/,
                replacement: path.resolve(configDir, "mocks/expo-ui-modifiers.ts"),
            },
            {
                find: /^@expo\/ui\/(swift-ui|jetpack-compose)$/,
                replacement: path.resolve(configDir, "mocks/expo-ui.tsx"),
            },
            {
                // O build web do expo-symbols importa `PlatformColor`, ausente no
                // react-native-web — sem o stub o bundle não monta.
                find: /^expo-symbols$/,
                replacement: path.resolve(configDir, "mocks/expo-symbols.tsx"),
            },
            {
                find: /^react-native-mmkv$/,
                replacement: path.resolve(configDir, "mocks/mmkv.ts"),
            },
            {
                find: /^expo-file-system(\/legacy)?$/,
                replacement: path.resolve(configDir, "mocks/expo-file-system.ts"),
            },
            { find: /^@\//, replacement: path.resolve(root, "src") + "/" },
            { find: /^#\//, replacement: path.resolve(root, "src") + "/" },
        ]

        config.define = { ...config.define, __DEV__: true }
        return config
    },
}

export default main
