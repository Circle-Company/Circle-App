import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import Routes from './src/routes'
import AuthContext from './src/contexts/auth'
import { AuthProvider } from './src/contexts/auth'

const App = () => {
  
  return (
    <NavigationContainer>
      <AuthProvider>
        <Routes/>
      </AuthProvider>
        
    </NavigationContainer>        
    
  
  )
}

export default App
