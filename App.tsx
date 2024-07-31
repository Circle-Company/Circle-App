import { DefaultTheme, NavigationContainer } from "@react-navigation/native"
import * as React from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context"
import { Provider as FeedProvider } from "./src/contexts/Feed"
import { Provider as PersistedProvider } from "./src/contexts/Persisted"
import { Provider as PreferencesProvider } from "./src/contexts/Preferences"
import { Provider as ToastProvider } from "./src/contexts/Toast"
import { Provider as AccountProvider } from "./src/contexts/account"
import { Provider as AuthProvider } from "./src/contexts/auth"
import { Provider as BottomSheetProvider } from "./src/contexts/bottomSheet"
import { Provider as BottomTabsProvider } from "./src/contexts/bottomTabs"
import { Provider as MemoryProvider } from "./src/contexts/memory"
import { Provider as NetworkProvider } from "./src/contexts/network"
import { Provider as NewMomentProvider } from "./src/contexts/newMoment"
import { Provider as NotificationProvider } from "./src/contexts/notification"
import { Provider as ProfileProvider } from "./src/contexts/profile"
import { Provider as SelectMomentsProvider } from "./src/contexts/selectMoments"
import { Provider as TrackingProvider } from "./src/contexts/tracking"
import { Provider as ViewProfileProvider } from "./src/contexts/viewProfile"
import ColorTheme from "./src/layout/constants/colors"
import sizes from "./src/layout/constants/sizes"
import { QueryProvider } from "./src/lib/react-query"
import Routes from "./src/routes"

function InnerApp() {
    const myTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: ColorTheme().background.toString(),
        },
    }

    return (
        <KeyboardProvider enabled={true}>
            <QueryProvider>
                <NotificationProvider>
                    <BottomSheetProvider>
                        <BottomTabsProvider>
                            <AccountProvider>
                                <ProfileProvider>
                                    <ViewProfileProvider>
                                        <FeedProvider>
                                            <NavigationContainer theme={myTheme}>
                                                <SelectMomentsProvider>
                                                    <MemoryProvider>
                                                        <NewMomentProvider>
                                                            <Routes />
                                                        </NewMomentProvider>
                                                    </MemoryProvider>
                                                </SelectMomentsProvider>
                                            </NavigationContainer>
                                        </FeedProvider>
                                    </ViewProfileProvider>
                                </ProfileProvider>
                            </AccountProvider>
                        </BottomTabsProvider>
                    </BottomSheetProvider>
                </NotificationProvider>
            </QueryProvider>
        </KeyboardProvider>
    )
}

function App() {
    return (
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <GestureHandlerRootView
                style={{ width: sizes.window.width, height: sizes.window.height }}
            >
                <ToastProvider>
                    <AuthProvider>
                        <PersistedProvider>
                            <PreferencesProvider>
                                <NetworkProvider>
                                    <TrackingProvider>
                                        <InnerApp />
                                    </TrackingProvider>
                                </NetworkProvider>
                            </PreferencesProvider>
                        </PersistedProvider>
                    </AuthProvider>
                </ToastProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    )
}

export default App
