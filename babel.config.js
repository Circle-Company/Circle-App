module.exports = {
    presets: ["module:metro-react-native-babel-preset"],
    plugins: [
        "@babel/plugin-transform-private-methods",
        "@babel/plugin-transform-class-properties",
        "@babel/plugin-transform-private-property-in-object",
        "@babel/plugin-proposal-optional-chaining",
        "react-native-worklets-core/plugin",
        [
        "module:react-native-dotenv",
        {
            envName: "APP_ENV",
            moduleName: "@env",
            path: ".env",
        },
        ],
        [
        "module-resolver",
        {
            root: ["./src"],
            alias: {
            "@/": "./src/",
            "@/components": "./src/components",
            "@/contexts": "./src/contexts",
            "@/features": "./src/features",
            "@/layout": "./src/layout",
            "@/routes": "./src/routes",
            "@/pages": "./src/pages",
            "@/store": "./src/store",
            "@/lib": "./src/lib",
            "@/helpers": "./src/helpers",
            "@/modules": "./src/modules",
            "@/assets": "./src/assets",
            "@/hooks": "./src/hooks",
            },
        },
        ],
        "react-native-reanimated/plugin", // ⚠️ OBRIGATORIAMENTE por último
    ],
};
