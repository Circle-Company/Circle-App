import { AccountScreenNavigator } from "./AccountNavigator"
import ColorTheme, { colors } from "../../constants/colors"
import Fonts from "../../constants/fonts"
import { HomeScreenNavigator } from "./HomeScreenNavigator"
import React from "react"
import fonts from "../../constants/fonts"
import CameraModule from "@/modules/camera"
import PersistedContext from "@/contexts/Persisted"

import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable"

const Tab = createNativeBottomTabNavigator()

export function BottomTabs() {
    //const { session } = React.useContext(PersistedContext)
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarLabelVisibilityMode: "unlabeled",
                tabBarActiveTintColor: ColorTheme().primary,
                tabBarInactiveTintColor: ColorTheme().text,
                tabBarActiveIndicatorColor: colors.purple.purple_05 + "",
                tabBarBlurEffect: "dark",
                headerBlurEffect: "dark",
                tabBarLabelStyle: {
                    fontFamily: Fonts.family["Bold-Italic"],
                    fontSize: fonts.size.body * 0.9,
                },
            }}
        >
            <Tab.Screen
                name="Moments"
                component={HomeScreenNavigator}
                options={{
                    tabBarIcon: {
                        templateSource: require("../../assets/icons/pngs/moments.png"),
                    } as any,
                    tabBarControllerMode: "tabbar",
                    headerBlurEffect: "dark",
                    tabBarLabelVisibilityMode: "unlabeled",
                    tabBarMinimizeBehavior: "never",
                }}
            />
            <Tab.Screen
                name="Create"
                component={CameraModule}
                options={{
                    tabBarIcon: {
                        templateSource: require("../../assets/icons/pngs/moments.png"),
                    } as any,
                    tabBarControllerMode: "sidebar",
                    tabBarLabelVisibilityMode: "unlabeled",
                    tabBarMinimizeBehavior: "never",
                }}
            />
            <Tab.Screen
                name="You"
                component={AccountScreenNavigator}
                options={{
                    tabBarIcon: {
                        templateSource: require("../../assets/icons/pngs/moments.png"),
                    } as any,
                    tabBarControllerMode: "tabbar",
                    tabBarMinimizeBehavior: "onScrollDown",
                    tabBarLabelVisibilityMode: "unlabeled",
                }}
            />
        </Tab.Navigator>
    )
}
