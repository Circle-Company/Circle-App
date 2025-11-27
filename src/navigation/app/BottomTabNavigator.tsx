import { AccountScreenNavigator } from "./AccountNavigator"
import ColorTheme from "../../constants/colors"
import Fonts from "../../constants/fonts"
import { HomeScreenNavigator } from "./HomeScreenNavigator"
import LanguageContext from "../../contexts/Preferences/language"
import Moment from "../../assets/icons/svgs/moments.svg"
import MomentOutline from "../../assets/icons/svgs/moments-outline.svg"
import React from "react"
import { Text } from "react-native"
import User from "../../assets/icons/svgs/@3.svg"
import UserOutline from "../../assets/icons/svgs/@.svg"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import sizes from "../../constants/sizes"

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
                    tabBarActiveTintColor: ColorTheme().text, // cor do texto quando ativo
                    tabBarInactiveTintColor: ColorTheme().icon, // cor do texto quando inativo
                    tabBarLabel: ({ focused, color }) => (
                        <Text
                            style={{
                                fontFamily: focused ? Fonts.family.Black : Fonts.family.Semibold,
                                fontSize: 10,
                                color,
                            }}
                        >
                            {t("Moments")}
                        </Text>
                    ),
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
                name="You"
                component={AccountScreenNavigator}
                options={{
                    title: t("You"),
                    tabBarActiveTintColor: ColorTheme().text, // cor do texto quando ativo
                    tabBarInactiveTintColor: ColorTheme().icon, // cor do texto quando inativo
                    tabBarLabel: ({ focused, color }) => (
                        <Text
                            style={{
                                fontFamily: focused ? Fonts.family.Black : Fonts.family.Semibold,
                                fontSize: 10,
                                color,
                            }}
                        >
                            {t("You")}
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <User
                                fill={String(ColorTheme().text)}
                                width={iconWidth - 1.7}
                                height={iconHeight - 1.7}
                            />
                        ) : (
                            <>
                                <UserOutline
                                    fill={String(ColorTheme().icon)}
                                    width={iconWidth}
                                    height={iconHeight}
                                />
                            </>
                        ),
                }}
            />
        </BottomTab.Navigator>
    )
}
