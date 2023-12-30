import {createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack"
import { NavigationContainer } from '@react-navigation/native'
import BottomTabNavigator from "./BottomTab/BottomTabNavigator"
import { SettingsNavigator } from "./SettingsNavigator"
import { MemoriesNavigator } from "./MemoriesNavigator"

export default function AppNavigator() {
    const App =  createStackNavigator()
    return(
      <App.Navigator
      initialRouteName="BottomTab"
      screenOptions={{
        headerShown: false,
      }}
    >
          <App.Screen
            name="BottomTab"
            component={BottomTabNavigator}
          />      
          <App.Screen
              name="SettingsNavigator"
              component={SettingsNavigator}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
              }}
          />
          <App.Screen
              name="MemoriesNavigator"
              component={MemoriesNavigator}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
              }}
          />   
    </App.Navigator>
    
    )
  
}