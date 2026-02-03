import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import { Slot, SplashScreen, useRouter, useSegments } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import React, { useEffect, useState } from "react"
import { useColorScheme } from "react-native"
import { useFonts } from "expo-font"

import { Provider as AccountProvider } from "@/contexts/account"
import AuthContext, { Provider as AuthProvider } from "@/contexts/auth"
import { Provider as BottomSheetProvider } from "@/contexts/bottomSheet"
import { Provider as FeedProvider } from "@/contexts/Feed"
import { Provider as GeolocationProvider } from "@/contexts/geolocation"
import { Provider as NetworkProvider } from "@/contexts/network"
import { Provider as NewMomentProvider } from "@/contexts/newMoment"
import { Provider as LanguageProvider } from "@/contexts/language"
import { Provider as ProfileProvider } from "@/contexts/profile"
import { CameraProvider } from "../modules/camera/context"
import { QueryProvider } from "@/lib/react-query"
import { Provider as RedirectProvider, RedirectContext } from "@/contexts/redirect"
import { Provider as ToastProvider } from "@/contexts/Toast"
import Fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { clearLikePressedNamespace } from "@/store"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
    const { checkIsSigned, sessionData } = React.useContext(AuthContext)
    const { redirectTo, setRedirectTo } = React.useContext(RedirectContext)
    const segments = useSegments()
    const router = useRouter()
    const [isInitializing, setIsInitializing] = useState(true)
    const scheme = useColorScheme()
    const hasRedirectedRef = React.useRef(false)
    // hasNavigated state removed; rendering <Slot /> directly

    // Inicializa o estado de redirect baseado na sessão
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const isAuthenticated = checkIsSigned()
                if (isAuthenticated) {
                    setRedirectTo("APP")
                } else {
                    setRedirectTo("SPLASH")
                }
            } catch (error) {
                console.error("❌ Erro ao inicializar auth:", error)
                setRedirectTo("SPLASH")
            } finally {
                setIsInitializing(false)
            }
        }

        initializeAuth()
    }, [])

    // Handle navigation based on auth state (stay on splash until decided)
    useEffect(() => {
        if (isInitializing || !redirectTo || hasRedirectedRef.current) {
            return
        }

        const isAuthenticated = redirectTo === "APP"
        hasRedirectedRef.current = true

        // Schedule navigation and only then hide splash + render the app
        requestAnimationFrame(() => {
            const target = isAuthenticated ? "/(tabs)/moments" : "/(auth)/init"
            // Navigate first, then hide splash to avoid NotFound flash
            router.replace(target)
            Promise.resolve().then(() => {
                SplashScreen.hideAsync().catch(() => {})
            })
        })
    }, [isInitializing, redirectTo, router])

    // Render app content; splash will be hidden right before navigation
    return <Slot />
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts(Fonts.files)

    // Keep the splash screen until navigation is resolved in RootLayoutNav
    useEffect(() => {
        // Intentionally do not hide splash here
    }, [fontsLoaded, fontError])

    // Clear ephemeral like-pressed memory namespace on cold start
    useEffect(() => {
        clearLikePressedNamespace()
    }, [])

    if (!fontsLoaded && !fontError) {
        return null
    }

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
                                    <LanguageProvider>
                                        <NetworkProvider>
                                            <GeolocationProvider>
                                                <CameraProvider>
                                                    <AccountProvider>
                                                        <ProfileProvider>
                                                            <FeedProvider>
                                                                <BottomSheetProvider>
                                                                    <NewMomentProvider>
                                                                        <RootLayoutNav />
                                                                    </NewMomentProvider>
                                                                </BottomSheetProvider>
                                                            </FeedProvider>
                                                        </ProfileProvider>
                                                    </AccountProvider>
                                                </CameraProvider>
                                            </GeolocationProvider>
                                        </NetworkProvider>
                                    </LanguageProvider>
                                </QueryProvider>
                            </AuthProvider>
                        </RedirectProvider>
                    </ToastProvider>
                </KeyboardProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    )
}
