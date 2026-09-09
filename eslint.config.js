// Flat config (ESLint 9). Substitui o `.eslintrc.json`, que o ESLint 9 não lê mais — era
// por isso que `npm run lint` só respondia "couldn't find eslint.config.js".
//
// A migração não foi um de-para linha a linha, porque o arquivo antigo não rodava nem no
// ESLint 8: ele declarava quatro plugins que **não estão instalados** (`react-native`,
// `jest`, `unused-imports` e o config `prettier`). Cada seção abaixo diz o que aconteceu com
// as regras que dependiam deles.
const expoConfig = require("eslint-config-expo/flat")
const typescriptEslint = require("@typescript-eslint/eslint-plugin")
const unusedImports = require("eslint-plugin-unused-imports")
const { defineConfig } = require("eslint/config")

/** Arquivos TypeScript — onde o plugin `@typescript-eslint` está registrado. */
const TS_FILES = ["**/*.ts", "**/*.tsx", "**/*.d.ts"]

/** Testes, setup e mocks. Rodam no Vitest. */
const TEST_FILES = [
    "**/*.{test,spec}.{ts,tsx}",
    "src/test-setup.ts",
    "src/tests/**",
    "__mocks__/**",
]

/** Globais do Vitest — `globals: true` no `vitest.config.ts` os injeta em tempo de teste. */
const vitestGlobals = {
    afterAll: "readonly",
    afterEach: "readonly",
    beforeAll: "readonly",
    beforeEach: "readonly",
    describe: "readonly",
    expect: "readonly",
    it: "readonly",
    suite: "readonly",
    test: "readonly",
    vi: "readonly",
    vitest: "readonly",
}

module.exports = defineConfig([
    {
        // `android/` e `ios/` são projetos nativos, `patches/` é diff de dependência, e
        // `.expo/`/`dist/` são gerados. Mesma exclusão que o `vitest.config.ts` faz.
        ignores: [
            "node_modules/**",
            "android/**",
            "ios/**",
            ".expo/**",
            "dist/**",
            "build/**",
            "coverage/**",
            "patches/**",
        ],
    },

    // Traz core + typescript + react + expo, com os globais de React Native e `__DEV__`.
    ...expoConfig,

    // ── Regras que valem para todo arquivo ────────────────────────────────────────────
    {
        settings: {
            react: { version: "detect" },
        },
        rules: {
            "no-var": "error",
            "no-empty": "warn",
            "no-empty-pattern": "warn",

            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "react/display-name": "warn",
            "react/no-unescaped-entities": "warn",
            // Desligada: o projeto é TypeScript strict, e as props já são checadas pelo tipo
            // do componente. Mantê-la significaria pedir `propTypes` em runtime para o que o
            // `tsc` já garante em build.
            "react/prop-types": "off",

            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // O `eslint-plugin-react-hooks` 7 passou a embutir o conjunto de regras do
            // **React Compiler**, tudo como `error` por padrão. Este projeto não liga o
            // compiler (não há `babel-plugin-react-compiler` no `babel.config.js`), então
            // essas regras descrevem um alvo que o build não persegue — e sozinhas somavam
            // ~270 erros, o que tornaria `npm run lint` inútil como portão.
            //
            // Ficam como aviso: continuam apontando padrões que realmente valem revisar
            // (ler `ref.current` no render, mutar props, `setState` dentro de efeito), sem
            // reprovar a base inteira. Se o compiler for adotado, o caminho é subir estas
            // para `error` de novo, uma por vez.
            "react-hooks/refs": "warn",
            "react-hooks/immutability": "warn",
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/purity": "warn",
            "react-hooks/static-components": "warn",
            "react-hooks/use-memo": "warn",
            "react-hooks/preserve-manual-memoization": "warn",

            // `@env` é virtual: quem o cria é o `react-native-dotenv` em tempo de build
            // (ver `babel.config.js`), então nenhum resolvedor de import acha o arquivo.
            "import/no-unresolved": ["error", { ignore: ["^@env$"] }],
        },
    },

    {
        // Scripts de manutenção rodam no Node, em CommonJS — daí `__dirname` e companhia.
        files: ["scripts/**/*.js", "*.config.js", "eslint.config.js"],
        languageOptions: {
            globals: {
                __dirname: "readonly",
                __filename: "readonly",
                console: "readonly",
                module: "writable",
                process: "readonly",
                require: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },

    // ── Regras de TypeScript ──────────────────────────────────────────────────────────
    // Escopadas a `.ts`/`.tsx` e com o plugin declarado aqui: em flat config os plugins são
    // resolvidos por objeto de configuração, então aplicar uma regra `@typescript-eslint/*`
    // num bloco sem `files` faz o ESLint procurá-la também nos `.js`, onde ela não existe.
    {
        files: TS_FILES,
        plugins: { "@typescript-eslint": typescriptEslint, "unused-imports": unusedImports },
        rules: {
            "@typescript-eslint/ban-ts-comment": "off",
            // Usado de propósito e em volume na camada de interceptors/stores (ver
            // CLAUDE.md): avisa, não barra.
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-namespace": "warn",
            // Era `no-var-requires`, renomeada no typescript-eslint v8.
            "@typescript-eslint/no-require-imports": "warn",

            // Par recomendado pelo `unused-imports` — e o mesmo que o `.eslintrc` antigo já
            // declarava, só que agora com o plugin de fato instalado. A diferença que importa
            // em relação a usar só o `@typescript-eslint/no-unused-vars`: `no-unused-imports`
            // **tem autofix**, então import morto se remove sozinho em vez de virar aviso
            // permanente. As duas regras base ficam desligadas para não reportar em dobro.
            //
            // O prefixo `_` segue sendo a forma de marcar algo intencionalmente ignorado.
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "warn",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },

    // Regras de formatação (`indent`, `quotes`, `semi`, `linebreak-style`) NÃO foram
    // recriadas. Quem manda no formato é o Prettier (`.prettierrc`: 4 espaços, aspas duplas,
    // sem ponto e vírgula, LF) — era exatamente esse o papel do `eslint-config-prettier` que
    // a config antiga listava sem ter instalado. Duplicar isso aqui só cria conflito entre as
    // duas ferramentas.
    //
    // `no-use-before-define` também ficou de fora: a convenção do projeto (e do React Native)
    // é declarar o componente primeiro e o `StyleSheet.create` no fim do arquivo, então a
    // regra marcaria praticamente toda tela sem apontar defeito nenhum.

    // ── Testes ────────────────────────────────────────────────────────────────────────
    {
        // Rodam no Vitest, não no Jest — o `env: jest/globals` e o `plugin:jest/recommended`
        // da config antiga apontavam para a ferramenta errada.
        files: TEST_FILES,
        plugins: { "@typescript-eslint": typescriptEslint },
        languageOptions: {
            globals: vitestGlobals,
        },
        rules: {
            // Mock e fixture vivem de `any`; exigir tipo exato aqui não paga.
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
])
