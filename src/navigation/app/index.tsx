import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import React from "react"
import ColorTheme from "../../layout/constants/colors"
import { Interpolation as Horizontal } from "../transitions/horizontal"
import BottomTabNavigator from "./BottomTabNavigator"
import { ExploreScreenNavigator } from "./ExploreScreenNavigator"
import { InboxNavigator } from "./InboxNavigator"
import { MemoriesNavigator } from "./MemoriesNavigator"
import { MomentNavigator } from "./MomentNavigator"
import { ProfileNavigator } from "./ProfileNavigator"
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
            <App.Screen
                name="SettingsNavigator"
                component={SettingsNavigator}
                options={{
                    cardStyleInterpolator: Horizontal,
                }}
            />
            <App.Screen
                name="ExploreNavigator"
                component={ExploreScreenNavigator}
                options={{
                    cardStyleInterpolator: Horizontal,
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
                name="MemoriesNavigator"
                component={MemoriesNavigator}
                options={{
                    cardStyleInterpolator: Horizontal,
                }}
            />
            <App.Screen
                name="InboxNavigator"
                component={InboxNavigator}
                options={{
                    cardStyleInterpolator: Horizontal,
                }}
            />
            <App.Screen
                name="ProfileNavigator"
                component={ProfileNavigator}
                options={{
                    cardStyleInterpolator: Horizontal,
                }}
            />
        </App.Navigator>
    )
}
