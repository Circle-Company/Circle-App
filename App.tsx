import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import Routes from './src/routes'
import { AuthProvider } from './src/contexts/auth'
import { ViewProfileProvider } from './src/contexts/viewProfile'

const App = () => {
  
  return (
    <NavigationContainer>
      <AuthProvider>
        <ViewProfileProvider>
          <Routes/>
        </ViewProfileProvider>
        
      </AuthProvider>
        
    </NavigationContainer>        
    
  
  )
}

export default App
