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

    // Handle navigation based on auth state (robust)
    useEffect(() => {
        if (isInitializing || !redirectTo || hasRedirectedRef.current) {
            return
        }

        const isAuthenticated = redirectTo === "APP"

        // Redirect once after the first auth resolution to ensure router is ready
        hasRedirectedRef.current = true
        if (isAuthenticated) {
            requestAnimationFrame(() => router.replace("/(tabs)/moments"))
        } else {
            requestAnimationFrame(() => router.replace("/(auth)/init"))
        }
    }, [isInitializing, redirectTo, router])

    return <Slot />
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts(Fonts.files)

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync()
        }
    }, [fontsLoaded, fontError])

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
