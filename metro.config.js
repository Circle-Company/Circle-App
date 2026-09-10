const { getDefaultConfig } = require("expo/metro-config")
// Export nomeado: no Storybook 10 esse caminho devolve `{ withStorybook }`, e não a
// função direto — `require(...)` sem desestruturar dá "withStorybook is not a function".
const { withStorybook } = require("@storybook/react-native/metro/withStorybook")

const config = getDefaultConfig(__dirname)

config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
    getTransformOptions: async () => ({
        transform: {
            experimentalImportSupport: false,
            inlineRequires: false,
        },
    }),
}

config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...config.resolver.sourceExts, "svg", "cjs", "mjs"],
    resolverMainFields: ["react-native", "browser", "main"],
    unstable_enablePackageExports: true,
}

/**
 * O Storybook só entra no bundle quando `STORYBOOK_ENABLED=true` (script
 * `npm run storybook`). Com a flag desligada o `onDisabledRemoveStorybook`
 * remove o pacote da árvore de módulos, então o app de produção não carrega
 * nada disso.
 */
module.exports = withStorybook(config, {
    enabled: process.env.STORYBOOK_ENABLED === "true",
    configPath: require("node:path").resolve(__dirname, ".rnstorybook"),
    onDisabledRemoveStorybook: true,
})
