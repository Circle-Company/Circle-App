import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import React from "react"
import UserOutline from "../../assets/icons/svgs/@.svg"
import User from "../../assets/icons/svgs/@3.svg"
import WorldOutline from "../../assets/icons/svgs/compass-outline.svg"
import World from "../../assets/icons/svgs/compass.svg"
import MomentOutline from "../../assets/icons/svgs/moments-outline.svg"
import Moment from "../../assets/icons/svgs/moments.svg"
import { BadgeIcon } from "../../components/general/badge-icon"
import ColorTheme from "../../constants/colors"
import sizes from "../../constants/sizes"
import PersistedContext from "../../contexts/Persisted"
import LanguageContext from "../../contexts/Preferences/language"
import { AccountScreenNavigator } from "./AccountNavigator"
import { ExploreScreenNavigator } from "./ExploreScreenNavigator"
import { HomeScreenNavigator } from "./HomeScreenNavigator"

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
                    tabBarActiveTintColor: ColorTheme().text, // cor do texto quando ativo
                    tabBarInactiveTintColor: ColorTheme().icon, // cor do texto quando inativo
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <Moment
                                fill={String(ColorTheme().text)}
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
                    tabBarActiveTintColor: ColorTheme().text, // cor do texto quando ativo
                    tabBarInactiveTintColor: ColorTheme().icon, // cor do texto quando inativo
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <World
                                fill={String(ColorTheme().text)}
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
                    tabBarActiveTintColor: ColorTheme().text, // cor do texto quando ativo
                    tabBarInactiveTintColor: ColorTheme().icon, // cor do texto quando inativo
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <User
                                fill={String(ColorTheme().text)}
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
