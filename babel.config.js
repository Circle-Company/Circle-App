module.exports = function (api) {
    api.cache(true)
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            // react-native-worklets/plugin is auto-loaded by babel-preset-expo as LAST plugin.
            // module-resolver applies project-wide (aliases must resolve everywhere).
            [
                "module-resolver",
                {
                    alias: {
                        "@": "./src",
                        "#": "./",
                    },
                    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
                },
            ],
        ],
        overrides: [
            {
                // react-native-dotenv MUST NOT run on node_modules — it breaks
                // Reanimated worklet serialization (mappers throw non-worklet
                // addListener/removeListener errors on the UI thread).
                // Function form is required because Metro calls loadPartialConfigSync
                // without a filename for cache key computation, which rejects regex.
                exclude: (filename) =>
                    typeof filename === "string" && filename.includes("/node_modules/"),
                plugins: [
                    [
                        "module:react-native-dotenv",
                        {
                            path: ".env",
                            blocklist: null,
                            allowlist: null,
                            safe: false,
                            allowUndefined: true,
                        },
                    ],
                ],
            },
        ],
    }
}
