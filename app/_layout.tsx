import { Slot, SplashScreen, useRouter, useSegments } from "expo-router"
import { useEffect, useState } from "react"
import * as React from "react"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { useColorScheme } from "react-native"
import { useFonts } from "expo-font"

import { Provider as AccountProvider } from "@/contexts/account"
import AuthContext, { Provider as AuthProvider } from "@/contexts/Auth"
import { Provider as BottomSheetProvider } from "@/contexts/bottomSheet"
import { Provider as BottomTabsProvider } from "@/contexts/bottomTabs"
import { Provider as FeedProvider } from "@/contexts/Feed"
import { Provider as GeolocationProvider } from "@/contexts/geolocation"
import { Provider as NetworkProvider } from "@/contexts/network"
import { Provider as NewMomentProvider } from "@/contexts/newMoment"
import { Provider as PreferencesProvider } from "@/contexts/Preferences"
import { Provider as ProfileProvider } from "@/contexts/profile"
import { CameraProvider } from "@/modules/camera/context"
import { QueryProvider } from "@/lib/react-query"
import { Provider as RedirectProvider, RedirectContext } from "@/contexts/redirect"
import { Provider as SelectMomentsProvider } from "@/contexts/selectMoments"
import StatusBar from "@/components/StatusBar"
import { Provider as ToastProvider } from "@/contexts/Toast"
import { Provider as ViewProfileProvider } from "@/contexts/viewProfile"
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

    // Check authentication and handle routing
    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                console.log("🔍 Verificando autenticação...")

                const authenticated = checkIsSigned()

                if (authenticated) {
                    console.log("✅ Usuário autenticado")
                    setRedirectTo("APP")
                } else {
                    console.log("❌ Usuário não autenticado")
                    setRedirectTo("AUTH")
                }
            } catch (error) {
                console.error("❌ Erro ao verificar autenticação:", error)
                setRedirectTo("AUTH")
            } finally {
                setIsInitializing(false)
            }
        }

        checkAuthentication()
    }, [checkIsSigned, sessionData])

    // Handle navigation based on auth state
    useEffect(() => {
        if (isInitializing || !redirectTo) {
            return
        }

        const inAuthGroup = segments[0] === "(auth)"
        const inTabsGroup = segments[0] === "(tabs)"
        const atRoot = segments.length === 0
        const isAuthenticated = redirectTo === "APP"

        console.log("📍 Navigation state:", {
            segments,
            inAuthGroup,
            inTabsGroup,
            atRoot,
            isAuthenticated,
            redirectTo,
        })

        if (isAuthenticated && (inAuthGroup || atRoot)) {
            // Authenticated and either in auth screens or at root → go to default tab
            console.log("🔄 Redirecting authenticated user to app (/(tabs)/moments)")
            router.replace("/(tabs)/moments")
        } else if (!isAuthenticated && !inAuthGroup) {
            // Not authenticated and not in auth screens → go to auth
            console.log("🔄 Redirecting unauthenticated user to auth (/(auth)/init)")
            router.replace("/(auth)/init")
        }
    }, [isInitializing, redirectTo, segments])

    return (
        <>
            <Slot />
        </>
    )
}

export default function RootLayout() {
    const scheme = useColorScheme()
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
                                    <PreferencesProvider>
                                        <NetworkProvider>
                                            <GeolocationProvider>
                                                <CameraProvider>
                                                    <BottomTabsProvider>
                                                        <AccountProvider>
                                                            <ProfileProvider>
                                                                <ViewProfileProvider>
                                                                    <FeedProvider>
                                                                        <BottomSheetProvider>
                                                                            <SelectMomentsProvider>
                                                                                <NewMomentProvider>
                                                                                    <RootLayoutNav />
                                                                                </NewMomentProvider>
                                                                            </SelectMomentsProvider>
                                                                        </BottomSheetProvider>
                                                                    </FeedProvider>
                                                                </ViewProfileProvider>
                                                            </ProfileProvider>
                                                        </AccountProvider>
                                                    </BottomTabsProvider>
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
}
