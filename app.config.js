const pkg = require("./package.json")

module.exports = function (_config) {
    const VERSION = pkg.version
    const PLATFORM = "ios"

    return {
        expo: {
            version: VERSION,
            name: "Circle App",
            slug: "Circle",
            scheme: "circle",
            owner: "circlecompany",
            runtimeVersion: { policy: "appVersion" },
            userInterfaceStyle: "dark",
            orientation: "portrait",
            primaryColor: "#1083fe",
            androidStatusBar: { barStyle: "light-content" },
            androidNavigationBar: { barStyle: "light-content" },
            android: {
                newArchEnabled: false,
                icon: "./assets/app-icons/android_icon_default_light.png",
                adaptiveIcon: {
                    foregroundImage: "./assets/icon-android-foreground.png",
                    monochromeImage: "./assets/icon-android-foreground.png",
                    backgroundImage: "./assets/icon-android-background.png",
                    backgroundColor: "#1185FE",
                },
                googleServicesFile: "./google-services.json",
                package: "com.circlecompany.circleapp",
            },
            ios: {
                supportsTablet: false,
                usesAppleSignIn: true,
                bundleIdentifier: "circlellc.circleapp",
                newArchEnabled: true,
                icon: "./assets/app-icons/ios-icon@x1.png",
                userInterfaceStyle: "automatic",
                infoPlist: {
                    UIApplicationSupportsIndirectInputEvents: true,
                    VKCImageAnalysisDisabled: true,
                    UISupportsLiveText: false,
                    UIViewControllerBasedStatusBarAppearance: true,
                },
            },
            web: { favicon: "./assets/favicon.png" },
            jsEngine: "jsc",
            plugins: [
                "expo-router",
                "expo-video",
                "expo-localization",
                [
                    "expo-web-browser",
                    {
                        experimentalLauncherActivity: true,
                    },
                ],
                ["react-native-edge-to-edge", { android: { enforceNavigationBarContrast: false } }],
                [
                    "expo-build-properties",
                    {
                        ios: { deploymentTarget: "15.1", newArchEnabled: true },
                        android: {
                            compileSdkVersion: 35,
                            targetSdkVersion: 35,
                            buildToolsVersion: "35.0.0",
                            newArchEnabled: false,
                        },
                    },
                ],
                [
                    "expo-notifications",
                    {
                        icon: "./assets/icon-android-notification.png",
                        color: "#1185fe",
                        sounds: PLATFORM === "ios" ? ["assets/dm.aiff"] : ["assets/dm.mp3"],
                    },
                ],
                "react-native-compressor",
                [
                    "expo-font",
                    {
                        fonts: [
                            "./assets/fonts/inter/Inter-Regular.otf",
                            "./assets/fonts/inter/Inter-Italic.otf",
                            "./assets/fonts/inter/Inter-SemiBold.otf",
                            "./assets/fonts/inter/Inter-SemiBoldItalic.otf",
                            "./assets/fonts/inter/Inter-Bold.otf",
                            "./assets/fonts/inter/Inter-BoldItalic.otf",
                            "./assets/fonts/inter/Inter-ExtraBold.otf",
                            "./assets/fonts/inter/Inter-ExtraBoldItalic.otf",
                        ],
                    },
                ],
                [
                    "expo-local-authentication",
                    {
                        faceIDPermission: "Allow $(PRODUCT_NAME) to use Face ID.",
                    },
                ],
                ["expo-apple-authentication"],
                [
                    "expo-splash-screen",
                    {
                        ios: {
                            image: "./assets/splash.png",
                            resizeMode: "cover",
                            backgroundColor: "#000000",
                        },
                        android: {
                            backgroundColor: "#000000",
                            image: "./assets/splash-android-icon.png",
                            imageWidth: 150,
                            dark: {
                                backgroundColor: "#000000",
                                image: "./assets/splash-android-icon-dark.png",
                                imageWidth: 150,
                            },
                        },
                    },
                ],
                ["expo-screen-orientation", { initialOrientation: "PORTRAIT_UP" }],
            ].filter(Boolean),
            extra: {
                eas: {
                    projectId: "eda55a59-2f40-4b7d-a419-f394bd8fd467",
                },
            },
        },
    }
}
