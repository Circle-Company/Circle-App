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

const App = () => {
  return (
    <NavigationContainer>
      <NetworkProvider>
        <AuthProvider>
          <TrackingProvider>
            <NotificationProvider>
              <ViewProfileProvider>
                <FeedProvider>
                  <SelectMomentsProvider>
                    <MemoryProvider>
                      <NewMomentProvider>
                          <Routes/>
                      </NewMomentProvider>                  
                    </MemoryProvider>
                  </SelectMomentsProvider>                
                </FeedProvider>
              </ViewProfileProvider>          
            </NotificationProvider>     
          </TrackingProvider>   
        </AuthProvider>        
      </NetworkProvider>
    </NavigationContainer>        
  )
}

export default App
