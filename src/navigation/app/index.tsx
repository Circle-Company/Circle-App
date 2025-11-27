import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import { ProfileNavigator, ProfileStackParamList } from "./ProfileNavigator"

import BottomTabNavigator from "./BottomTabNavigator"
import ColorTheme from "../../constants/colors"
import CreateBottomTabNavigator from "./CreateBottomTabNavigator"
import { Interpolation as HorizontalRight } from "../transitions/horizontal-right"
import { MomentNavigator } from "./MomentNavigator"
import React from "react"
import { SettingsNavigator } from "./SettingsNavigator"

export default function AppNavigator() {
    const App = createStackNavigator()
    return (
        <App.Navigator
            initialRouteName="BottomTab"
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: String(ColorTheme().background) },
            }}
        >
            <App.Screen name="BottomTab" component={BottomTabNavigator} />
            <App.Screen name="CreateBottomTab" component={CreateBottomTabNavigator} />
            <App.Screen
                name="SettingsNavigator"
                component={SettingsNavigator}
                options={{
                    cardStyleInterpolator: HorizontalRight,
                }}
            />
            <App.Screen
                name="MomentNavigator"
                component={MomentNavigator}
                options={{
                    cardStyleInterpolator: CardStyleInterpolators.forNoAnimation,
                }}
            />
            <App.Screen
                name="ProfileNavigator"
                component={ProfileNavigator}
                options={{
                    cardStyleInterpolator: HorizontalRight,
                }}
            />
        </App.Navigator>
    )
}

declare global {
    namespace ReactNavigation {
        interface ProfileParamList extends ProfileStackParamList {}
    }
}
