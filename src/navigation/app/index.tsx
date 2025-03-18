import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import React from "react"
import ColorTheme from "../../layout/constants/colors"
import { Interpolation as HorizontalLeft } from "../transitions/horizontal-left"
import { Interpolation as HorizontalRight } from "../transitions/horizontal-right"
import BottomTabNavigator from "./BottomTabNavigator"
import CreateBottomTabNavigator from "./CreateBottomTabNavigator"
import { ExploreScreenNavigator } from "./ExploreScreenNavigator"
import { InboxNavigator } from "./InboxNavigator"
import { MemoriesNavigator } from "./MemoriesNavigator"
import { MomentNavigator } from "./MomentNavigator"
import { ProfileNavigator, ProfileStackParamList } from "./ProfileNavigator"
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
                name="ExploreNavigator"
                component={ExploreScreenNavigator}
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
                name="MemoriesNavigator"
                component={MemoriesNavigator}
                options={{
                    cardStyleInterpolator: HorizontalRight,
                }}
            />
            <App.Screen
                name="InboxNavigator"
                component={InboxNavigator}
                options={{
                    cardStyleInterpolator: HorizontalLeft,
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
