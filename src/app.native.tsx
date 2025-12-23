import * as React from "react"
import * as SplashScreen from "expo-splash-screen"

import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import { Text, TextInput, useColorScheme } from "react-native"

import { Provider as AccountProvider } from "./contexts/account"
import { Provider as AuthProvider } from "./contexts/Auth"
import { Provider as BottomSheetProvider } from "./contexts/bottomSheet"
import { Provider as BottomTabsProvider } from "./contexts/bottomTabs"
import ColorTheme from "./constants/colors"
import { Provider as FeedProvider } from "./contexts/Feed"
import Fonts from "@/constants/fonts"
import { Provider as GeolocationProvider } from "./contexts/geolocation"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { Provider as NetworkProvider } from "./contexts/network"
import { Provider as NewMomentProvider } from "./contexts/newMoment"
import { Provider as PreferencesProvider } from "./contexts/Preferences"
import { Provider as ProfileProvider } from "./contexts/profile"
import { CameraProvider } from "./modules/camera/context"
import { QueryProvider } from "./lib/react-query"
import { Provider as RedirectProvider } from "./contexts/redirect"
import Routes from "./routes"
import { Provider as SelectMomentsProvider } from "./contexts/selectMoments"
import StatusBar from "./components/StatusBar"
import { Provider as ToastProvider } from "./contexts/Toast"
import { Provider as ViewProfileProvider } from "./contexts/viewProfile"
import sizes from "@/constants/sizes"
import { useEffect } from "react"
import { useFonts } from "expo-font"

SplashScreen.preventAutoHideAsync().catch(() => undefined)

type TextComponent = typeof Text & { defaultProps?: { style?: any } }
type TextInputComponent = typeof TextInput & { defaultProps?: { style?: any } }

function InnerApp() {
    console.log("🔄 InnerApp carregando...")

    try {
        const scheme = useColorScheme()
        const themeColors = ColorTheme()
        const myTheme = React.useMemo(
            () => ({
                ...DefaultTheme,
                colors: {
                    ...DefaultTheme.colors,
                    background: themeColors.background.toString(),
                    card: themeColors.background.toString(),
                },
            }),
            [scheme, themeColors.background],
        )

        console.log("🎨 Tema configurado, renderizando providers...")

        return (
            <BottomTabsProvider>
                <AccountProvider>
                    <ProfileProvider>
                        <ViewProfileProvider>
                            <FeedProvider>
                                <NavigationContainer key={scheme || "default"} theme={myTheme}>
                                    <BottomSheetProvider>
                                        <SelectMomentsProvider>
                                            <NewMomentProvider>
                                                <Routes />
                                            </NewMomentProvider>
                                        </SelectMomentsProvider>
                                    </BottomSheetProvider>
                                </NavigationContainer>
                            </FeedProvider>
                        </ViewProfileProvider>
                    </ProfileProvider>
                </AccountProvider>
            </BottomTabsProvider>
        )
    } catch (error) {
        console.error("❌ Erro no InnerApp:", error)
        throw error
    }
}

function App() {
    console.log("🚀 App.tsx carregou - Iniciando aplicação")

    const [fontsLoaded, fontError] = useFonts(Fonts.files)

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync().catch(() => undefined)
        }
    }, [fontsLoaded, fontError])

    if (!fontsLoaded && !fontError) {
        return null
    }

    try {
        return (
            <SafeAreaProvider initialMetrics={initialWindowMetrics}>
                <GestureHandlerRootView
                    style={{
                        width: sizes.window.width,
                        height: sizes.window.height,
                        backgroundColor: "#000",
                    }}
                >
                    <KeyboardProvider enabled>
                        <ToastProvider>
                            <RedirectProvider>
                                <AuthProvider>
                                    <QueryProvider>
                                        <PreferencesProvider>
                                            <NetworkProvider>
                                                <GeolocationProvider>
                                                    <CameraProvider>
                                                        <StatusBar
                                                            barStyle="light-content"
                                                            backgroundColor="#000"
                                                            translucent={false}
                                                        />
                                                        <InnerApp />
                                                    </CameraProvider>
                                                </GeolocationProvider>
                                            </NetworkProvider>
                                        </PreferencesProvider>
                                    </QueryProvider>
                                </AuthProvider>
                            </RedirectProvider>
                        </ToastProvider>
                    </KeyboardProvider>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        )
    } catch (error) {
        console.error("❌ Erro crítico na inicialização da App:", error)
        throw error
    }
}

export default App
