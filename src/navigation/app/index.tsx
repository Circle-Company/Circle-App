import {createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack"
import BottomTabNavigator from "./BottomTabNavigator"
import { SettingsNavigator } from "./SettingsNavigator"
import { MemoriesNavigator } from "./MemoriesNavigator"
import { InboxNavigator } from "./InboxNavigator"
import { ProfileNavigator } from "./ProfileNavigator"
import { MomentNavigator } from "./MomentNavigator"
import ColorTheme from "../../layout/constants/colors"

export default function AppNavigator() {
    const App =  createStackNavigator()
    return(
        <App.Navigator
            initialRouteName="BottomTab"
            screenOptions={{
                headerShown: false,
                cardOverlayEnabled: true,
                cardStyle: {backgroundColor: String(ColorTheme().background)}
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
                name="MomentNavigator"
                component={MomentNavigator}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forNoAnimation
                }}
            />
            <App.Screen
                name="MemoriesNavigator"
                component={MemoriesNavigator}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                }}
            />
            <App.Screen
              name="InboxNavigator"
              component={InboxNavigator}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
              }}
            />
            <App.Screen
                name="ProfileNavigator"
                component={ProfileNavigator}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                }}
            /> 
        </App.Navigator>
    )
  
}