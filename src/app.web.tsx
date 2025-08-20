import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import * as React from "react"
import { View } from "react-native"
import ColorTheme from "./constants/colors"
import sizes from "@/constants/sizes.web"
import { Provider as AccountProvider } from "./contexts/account"
import { Provider as AuthProvider } from "./contexts/Auth"
import { Provider as BottomSheetProvider } from "./contexts/bottomSheet"
import { Provider as BottomTabsProvider } from "./contexts/bottomTabs"
import { Provider as FeedProvider } from "./contexts/Feed"
import { Provider as GeolocationProvider } from "./contexts/geolocation"
import { Provider as MemoryProvider } from "./contexts/memory"
import { Provider as NearProvider } from "./contexts/near"
import { Provider as NetworkProvider } from "./contexts/network"
import { Provider as NewMomentProvider } from "./contexts/newMoment"
import { Provider as NotificationProvider } from "./contexts/notification"
import { Provider as PersistedProvider } from "./contexts/Persisted"
import { Provider as PreferencesProvider } from "./contexts/Preferences"
import { Provider as ProfileProvider } from "./contexts/profile"
import { Provider as RedirectProvider } from "./contexts/redirect"
import { Provider as SelectMomentsProvider } from "./contexts/selectMoments"
import { Provider as ToastProvider } from "./contexts/Toast"
import { Provider as ViewProfileProvider } from "./contexts/viewProfile"
import { QueryProvider } from "./lib/react-query"
import Routes from "./routes"

// Web-specific wrapper component for safe area
function SafeAreaProviderWeb({ children }: { children: React.ReactNode }) {
    return (
        <View style={{ flex: 1, width: "100%" }}>
            {children}
        </View>
    )
}

// Web-specific wrapper for gesture handler
function GestureHandlerRootViewWeb({ children }: { children: React.ReactNode }) {
    return (
        <View style={{ width: sizes.window.width, height: sizes.window.height, flex: 1 }}>
            {children}
        </View>
    )
}

// Web-specific keyboard provider (no-op for web)
function KeyboardProviderWeb({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}

function InnerApp() {
    const myTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: ColorTheme().background.toString(),
        },
    }

    return (
        <NotificationProvider>
            <BottomTabsProvider>
                <AccountProvider>
                    <ProfileProvider>
                        <ViewProfileProvider>
                            <FeedProvider>
                                <NearProvider>
                                    <NavigationContainer theme={myTheme}>
                                        <BottomSheetProvider>
                                            <SelectMomentsProvider>
                                                <MemoryProvider>
                                                    <NewMomentProvider>
                                                        <Routes />
                                                    </NewMomentProvider>
                                                </MemoryProvider>
                                            </SelectMomentsProvider>
                                        </BottomSheetProvider>
                                    </NavigationContainer>
                                </NearProvider>
                            </FeedProvider>
                        </ViewProfileProvider>
                    </ProfileProvider>
                </AccountProvider>
            </BottomTabsProvider>
        </NotificationProvider>
    )
}

function App() {
    console.log("App.web.tsx carregou")
    
    // Web-specific styles for full viewport
    React.useEffect(() => {
        // Set body styles for web
        if (typeof document !== 'undefined') {
            document.body.style.margin = '0'
            document.body.style.padding = '0'
            document.body.style.overflow = 'hidden'
            document.body.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }
    }, [])

    return (
        <SafeAreaProviderWeb>
            <GestureHandlerRootViewWeb>
                <KeyboardProviderWeb>
                    <ToastProvider>
                        <RedirectProvider>
                            <AuthProvider>
                                <PersistedProvider>
                                    <QueryProvider>
                                        <PreferencesProvider>
                                            <NetworkProvider>
                                                <GeolocationProvider>
                                                    <InnerApp />
                                                </GeolocationProvider>
                                            </NetworkProvider>
                                        </PreferencesProvider>
                                    </QueryProvider>
                                </PersistedProvider>
                            </AuthProvider>
                        </RedirectProvider>
                    </ToastProvider>
                </KeyboardProviderWeb>
            </GestureHandlerRootViewWeb>
        </SafeAreaProviderWeb>
    )
}

export default App
