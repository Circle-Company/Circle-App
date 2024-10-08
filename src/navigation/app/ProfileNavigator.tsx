import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import ColorTheme from "../../layout/constants/colors"
import ProfileScreen from "../../pages/app/Profile"
import { Interpolation as Horizontal } from "../transitions/horizontal-right"

const ProfileStack = createStackNavigator()

export function ProfileNavigator() {
    return (
        <ProfileStack.Navigator
            screenOptions={{
                cardStyleInterpolator: Horizontal,
            }}
        >
            <ProfileStack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    headerShown: false,
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                }}
            />
        </ProfileStack.Navigator>
    )
}
