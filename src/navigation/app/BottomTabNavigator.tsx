import { AccountScreenNavigator } from "./AccountNavigator"
import { BadgeIcon } from "@/components/general/badge-icon"
import ColorTheme from "../../layout/constants/colors"
import { ExploreScreenNavigator } from "./ExploreScreenNavigator"
import { HomeScreenNavigator } from "./HomeScreenNavigator"
import LanguageContext from "../../contexts/Preferences/language"
import Moment from "../../assets/icons/svgs/moments.svg"
import MomentOutline from "../../assets/icons/svgs/moments-outline.svg"
import PersistedContext from "@/contexts/Persisted"
import React from "react"
import User from "../../assets/icons/svgs/@3.svg"
import UserOutline from "../../assets/icons/svgs/@.svg"
import World from "../../assets/icons/svgs/compass.svg"
import WorldOutline from "../../assets/icons/svgs/compass-outline.svg"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import sizes from "../../layout/constants/sizes"

const BottomTab = createBottomTabNavigator()

export default function BottomTabNavigator() {
    const { t } = React.useContext(LanguageContext)
    const { session } = React.useContext(PersistedContext)
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
                name="World"
                component={ExploreScreenNavigator}
                options={{
                    title: t("Explore"),
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <World
                                fill={String(ColorTheme().iconFocused)}
                                width={iconWidth}
                                height={iconHeight}
                            />
                        ) : (
                            <WorldOutline
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
                            <>
                                <UserOutline
                                    fill={String(ColorTheme().icon)}
                                    width={iconWidth}
                                    height={iconHeight}
                                />
                                <BadgeIcon
                                    style={{ left: "51%", top: -5 }}
                                    number={session.account.unreadNotificationsCount}
                                />
                            </>
                        ),
                }}
            />
        </BottomTab.Navigator>
    )
}
