import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
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
import sizes from './src/layout/constants/sizes'

function InnerApp() {
  return (
    <KeyboardProvider enabled={true}>
      <NotificationProvider>
        <ViewProfileProvider>
          <FeedProvider>
            <NavigationContainer>
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
      </NotificationProvider>       
    </KeyboardProvider>   

  )
}

const App = () => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{width: sizes.window.width, height: sizes.window.height}}>
        <ToastProvider>
          <NetworkProvider>
            <AuthProvider>
              <PersistedProvider>
                <PreferencesProvider>
                  <TrackingProvider>
                      <InnerApp/>
                  </TrackingProvider>                 
                </PreferencesProvider>
              </PersistedProvider>
            </AuthProvider>        
          </NetworkProvider>        
        </ToastProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

export default App
