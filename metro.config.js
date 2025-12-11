const { getDefaultConfig } = require("expo/metro-config")

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

module.exports = config
