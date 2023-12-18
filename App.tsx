import * as React from 'react'
import { useColorScheme, Easing, Animated } from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStackNavigator, CardStyleInterpolators, HeaderStyleInterpolators, TransitionSpecs} from '@react-navigation/stack'
import { useSelector } from 'react-redux'

import {HomeScreenNavigator } from './src/navigation/HomeScreenNavigator'
import AuthNavigator from './src/navigation/AuthNavigator'
import BottomTabNavigator from './src/navigation/BottomTabNavigator'

import StartScreen from './src/pages/auth/Splash'

import {useMomentContext} from './src/components/moment/moment-context'
import {useUserShowContext} from './src/components/user_show/user_show-context'
import {useMidiaRenderContext} from './src/components/midia_render/midia_render-context'

const ScreensNavigator = () => {
  const Stack =  createStackNavigator()
  return(
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName='HomeNavigator'
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS
        }}
        >
          <Stack.Screen
            name="HomeNavigator"
            component={HomeScreenNavigator}
          />      
      </Stack.Navigator>
    </NavigationContainer>    
  )

}
/**
 *  { isAuth && <ScreensNavigator/>}
    { !isAuth && didTryAutoLogin && <AuthNavigator/>}
    { !isAuth && !didTryAutoLogin && <StartScreen/>}
 */

const App = () => {

  return (
      <NavigationContainer>
        <BottomTabNavigator/>
      </NavigationContainer>      

  );
};

export default App;
