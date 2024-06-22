import * as React from 'react'
import { DefaultTheme, NavigationContainer} from '@react-navigation/native'
import Routes from './src/routes'
import { AuthProvider } from './src/contexts/auth'
import { ViewProfileProvider } from './src/contexts/viewProfile'
import { NotificationProvider } from './src/contexts/notification'
import { SelectMomentsProvider } from './src/contexts/selectMoments'
import { NewMomentProvider } from './src/contexts/newMoment'
import { FeedProvider } from './src/contexts/Feed'
import { MemoryProvider } from './src/contexts/memory'
import { TrackingProvider } from './src/contexts/tracking'
import { NetworkProvider } from './src/contexts/network'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {KeyboardProvider} from 'react-native-keyboard-controller'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as PreferencesProvider } from './src/contexts/Preferences'
import { Provider as PersistedProvider } from './src/contexts/Persisted'
import { Provider as ToastProvider } from './src/contexts/Toast'
import { Provider as ProfileProvider } from './src/contexts/profile'
import { Provider as BottomTabsProvider } from './src/contexts/bottomTabs'
import { Provider as BottomSheetProvider } from './src/contexts/bottomSheet'
import sizes from './src/layout/constants/sizes'
import ColorTheme from './src/layout/constants/colors'



function InnerApp() {
  const myTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: ColorTheme().background.toString()
    }
  }

  return (
    <KeyboardProvider enabled={true}>
      <NotificationProvider>
        <BottomSheetProvider>
          <BottomTabsProvider>
            <ProfileProvider>
              <ViewProfileProvider>
                <FeedProvider>
                  <NavigationContainer theme={myTheme}>
                    <SelectMomentsProvider>
                      <MemoryProvider>
                        <NewMomentProvider>
                          <Routes/>
                        </NewMomentProvider>                  
                      </MemoryProvider>
                    </SelectMomentsProvider>                
                  </NavigationContainer>
                </FeedProvider>
              </ViewProfileProvider>           
            </ProfileProvider>          
          </BottomTabsProvider>
        </BottomSheetProvider>
      </NotificationProvider>          
    </KeyboardProvider>   
  )
}

const App = () => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{width: sizes.window.width, height: sizes.window.height}}>
        <ToastProvider>
            <AuthProvider>
              <PersistedProvider>
                <PreferencesProvider>
                  <NetworkProvider>
                  <TrackingProvider>
                      <InnerApp/>
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
