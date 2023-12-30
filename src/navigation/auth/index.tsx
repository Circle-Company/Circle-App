import { createStackNavigator, CardStyleInterpolators} from '@react-navigation/stack'
import React from 'react'
import InitScreen from '../../pages/auth/Splash'
import RegisterScreen from '../../pages/auth/Register'
import LoginScreen from '../../pages/auth/SignIn'

const AuthStack = createStackNavigator();
export default function AuthNavigator(){
    return(
      <AuthStack.Navigator initialRouteName={'Init'} screenOptions={{cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS}}>
        <AuthStack.Screen
          name="Init"
          component={InitScreen}
          options={{headerShown: false}}
        />
        <AuthStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false}}
        />
        <AuthStack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
      </AuthStack.Navigator>
    )
}