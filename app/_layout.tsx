import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import { Stack, SplashScreen, useRouter } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import React, { useEffect, useState } from "react"
import { useFonts } from "expo-font"

import { Provider as AuthProvider } from "@/contexts/auth"
import LanguageContext, { Provider as LanguageProvider } from "@/contexts/language"
import { colors } from "@/constants/colors"
import { Provider as BottomSheetProvider } from "@/contexts/bottomSheet"
import { Provider as FeedProvider } from "@/contexts/Feed"
import { Provider as GeolocationProvider } from "@/contexts/geolocation"
import { Provider as NetworkProvider } from "@/contexts/network"
import { Provider as NewMomentProvider } from "@/contexts/newMoment"
import { Provider as ProfileProvider } from "@/contexts/profile"
import { PushNotificationProvider } from "@/contexts/push.notification"
import { Provider as ChatProvider } from "@/contexts/Chat"
import { CameraProvider } from "../modules/camera/context"
import { QueryProvider } from "@/lib/react-query"
import { Provider as RedirectProvider, RedirectContext } from "@/contexts/redirect"
import { decideEntryScreen } from "@/session/apple"
import { readSession } from "@/session/storage"
import { setPendingEntryScreen } from "@/session/runtime"
import { Provider as ToastProvider } from "@/contexts/Toast"
import Fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { clearLikePressedNamespace } from "@/store"
import { useScreenTracking } from "@/lib/hooks/useScreenTracking"
import { TutorialProvider } from "@/contexts/tutorial"
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
    const { redirectTo, setRedirectTo } = React.useContext(RedirectContext)
    const { t } = React.useContext(LanguageContext)
    const router = useRouter()
    const [isInitializing, setIsInitializing] = useState(true)
    const hasRedirectedRef = React.useRef(false)

    // Uma linha cobre toda a navegação do app: dispara `screen_viewed` a cada
    // mudança de rota, sem precisar instrumentar tela por tela.
    useScreenTracking()

    const settingsHeader = {
        headerShown: true,
        headerBackTitle: t("Back"),
        headerTintColor: colors.gray.white,
        headerStyle: { backgroundColor: colors.gray.black },
        headerTitleStyle: {
            fontFamily: Fonts.family["Black-Italic"],
            color: colors.gray.white,
        },
    } as const
    // hasNavigated state removed; rendering <Slot /> directly

    // Inicializa o estado de redirect a partir da sessão persistida (§5.1).
    //
    // A decisão deixou de ser "tem token no MMKV?" e passou a ser a união do §2.3, que
    // distingue três coisas que o booleano juntava: nunca logou, deslogado mas o device
    // lembra de quem, e sessão viva. O estado do meio é o que permite o re-auth de um toque
    // em vez da tela de login em branco (§5.8).
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const screen = await decideEntryScreen(readSession())
                setRedirectTo(screen.kind === "app" ? "APP" : "SPLASH")

                // A decisão fica disponível para a tela de entrada oferecer
                // "entrar como @fulano" (§5.8). A tela em si ainda não existe — enquanto
                // não existir, `one-tap` se comporta como login completo, que é o
                // degradado correto: pior UX, nunca comportamento errado.
                setPendingEntryScreen(screen)
            } catch (error) {
                // Nada aqui pode impedir o app de subir: sem decisão, vai para a tela de
                // entrada, que sempre funciona.
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
            const target = isAuthenticated ? "/(tabs)/create" : "/(auth)/init"
            // Navigate first, then hide splash to avoid NotFound flash
            router.replace(target)
            Promise.resolve().then(() => {
                SplashScreen.hideAsync().catch(() => {})
            })
        })
    }, [isInitializing, redirectTo, router])

    // Render app content; splash will be hidden right before navigation
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                animationMatchesGesture: true,
                gestureEnabled: true,
                contentStyle: { backgroundColor: "#000" },
            }}
        >
            <Stack.Screen
                name="inbox/index"
                options={{ ...settingsHeader, headerTitle: t("Inbox") }}
            />
            <Stack.Screen
                name="settings/index"
                options={{ ...settingsHeader, headerTitle: t("Settings") }}
            />
            <Stack.Screen
                name="settings/profile-picture"
                options={{ ...settingsHeader, headerTitle: t("Add Profile Picture") }}
            />
            <Stack.Screen
                name="settings/name"
                options={{ ...settingsHeader, headerTitle: t("Name") }}
            />
            <Stack.Screen
                name="settings/personal-data"
                options={{ ...settingsHeader, headerTitle: t("Personal Data") }}
            />
            <Stack.Screen
                name="settings/content"
                options={{ ...settingsHeader, headerTitle: t("Content") }}
            />
            <Stack.Screen
                name="settings/blocked-users"
                options={{ ...settingsHeader, headerTitle: t("Blocked Users") }}
            />
            <Stack.Screen
                name="settings/exclude-account"
                options={{ ...settingsHeader, headerTitle: t("Delete Account") }}
            />
            <Stack.Screen
                name="settings/language"
                options={{ ...settingsHeader, headerTitle: t("Language") }}
            />
            <Stack.Screen
                name="settings/log-out"
                options={{ ...settingsHeader, headerTitle: t("Log Out") }}
            />
        </Stack>
    )
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
                    <RedirectProvider>
                        <AuthProvider>
                            <QueryProvider>
                                <ToastProvider>
                                    <TutorialProvider>
                                        <LanguageProvider>
                                            <NetworkProvider>
                                                <GeolocationProvider>
                                                    <CameraProvider>
                                                        <ProfileProvider>
                                                            <FeedProvider>
                                                                <BottomSheetProvider>
                                                                    <NewMomentProvider>
                                                                        <PushNotificationProvider>
                                                                            <ChatProvider>
                                                                                <RootLayoutNav />
                                                                            </ChatProvider>
                                                                        </PushNotificationProvider>
                                                                    </NewMomentProvider>
                                                                </BottomSheetProvider>
                                                            </FeedProvider>
                                                        </ProfileProvider>
                                                    </CameraProvider>
                                                </GeolocationProvider>
                                            </NetworkProvider>
                                        </LanguageProvider>
                                    </TutorialProvider>
                                </ToastProvider>
                            </QueryProvider>
                        </AuthProvider>
                    </RedirectProvider>
                </KeyboardProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    )
}
