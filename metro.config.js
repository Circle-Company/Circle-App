const { getDefaultConfig } = require("metro-config")

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts },
    } = await getDefaultConfig()
    return {
        transformer: {
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: true,
                },
            }),
            babelTransformerPath: require.resolve("react-native-svg-transformer"),
        },
        resolver: {
            assetExts: assetExts.filter((ext) => ext !== "svg"),
            sourceExts: [...sourceExts, "svg"],
        },
        server: {
            enhanceMiddleware: (middleware) => {
                return (req, res, next) => {
                    if (req.url === "/debugger-ui") {
                        res.statusCode = 200
                        res.end("") // Responde com vazio para evitar o erro
                        return
                    }
                    return middleware(req, res, next)
                }
            },
        },
    }
})()
