module.exports = {
    presets: ["module:metro-react-native-babel-preset"],
    plugins: [
        "react-native-reanimated/plugin",
        ["@babel/plugin-proposal-decorators", { legacy: true }],
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
                    "@": "./src",
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
    ],
}
