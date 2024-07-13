import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import React from "react"
import LanguageContext from "../../contexts/Preferences/language"
import ColorTheme from "../../layout/constants/colors"
import sizes from "../../layout/constants/sizes"

import { AccountScreenNavigator } from "./AccountNavigator"
import { HomeScreenNavigator } from "./HomeScreenNavigator"

import MomentOutline from "../../assets/icons/svgs/moments-outline.svg"
import Moment from "../../assets/icons/svgs/moments.svg"
import { default as User, default as UserOutline } from "../../assets/icons/svgs/user.svg"

const BottomTab = createBottomTabNavigator()

export default function BottomTabNavigator() {
    const { t } = React.useContext(LanguageContext)
    const iconWidth = 21
    const iconHeight = 21
    const tabBarStyle = {
        ...sizes.bottomTab,
        backgroundColor: ColorTheme().background,
    }
    return (
        <BottomTab.Navigator
            initialRouteName="Moments"
            screenOptions={{
                tabBarHideOnKeyboard: true,
                headerShown: false,
                tabBarStyle: tabBarStyle,
            }}
        >
            <BottomTab.Screen
                name="Moments"
                component={HomeScreenNavigator}
                options={{
                    title: t("Moments"),
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <Moment
                                fill={String(ColorTheme().iconFocused)}
                                width={iconWidth}
                                height={iconHeight}
                            />
                        ) : (
                            <MomentOutline
                                fill={String(ColorTheme().icon)}
                                width={iconWidth}
                                height={iconHeight}
                            />
                        ),
                }}
            />
            <BottomTab.Screen
                name="You"
                component={AccountScreenNavigator}
                options={{
                    title: t("You"),
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <User
                                fill={String(ColorTheme().iconFocused)}
                                width={iconWidth}
                                height={iconHeight}
                            />
                        ) : (
                            <UserOutline
                                fill={String(ColorTheme().icon)}
                                width={iconWidth}
                                height={iconHeight}
                            />
                        ),
                }}
            />
        </BottomTab.Navigator>
    )
}
