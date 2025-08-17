import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import * as React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import ColorTheme from "./constants/colors"
import sizes from "./constants/sizes"
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
    console.log("App.tsx carregou")
    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <GestureHandlerRootView
                style={{ width: sizes.window.width, height: sizes.window.height }}
            >
                <KeyboardProvider enabled>
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
                </KeyboardProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    )
}

export default App
