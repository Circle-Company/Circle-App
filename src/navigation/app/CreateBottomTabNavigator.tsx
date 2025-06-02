import ColorTheme, { colors } from "../../layout/constants/colors"
import { Text, View, useColorScheme } from "react-native"

import { MemoriesNavigator } from "./MemoriesNavigator"
import Memory from "../../assets/icons/svgs/memory.svg"
import Moment from "../../assets/icons/svgs/bolt.svg"
import { MomentNavigator } from "./MomentNavigator"
import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import fonts from "@/layout/constants/fonts"
import sizes from "../../layout/constants/sizes"

const BottomTab = createBottomTabNavigator()

const focusedTabStyle = (isDarkMode: boolean) => ({
    paddingLeft: 20,
    width: 140,
    borderRadius: (sizes.bottomTab.height * 1.2) / 2,
    flex: 1,
    backgroundColor: isDarkMode ? colors.gray.white : colors.gray.black,
    flexDirection: "row" as const,
    alignItems: "center" as const,
})

const unfocusedTabStyle = (side: "left" | "right") => ({
    marginLeft: side === "left" ? 0 : undefined,
    marginRight: side === "right" ? 0 : undefined,
})

export default function CreateBottomTabNavigator() {
    const isDarkMode = useColorScheme()
    const { icon, background, backgroundDisabled } = ColorTheme()
    const iconWidth = 24
    const iconHeight = 24

    // Customização da TabBar
    const tabBarStyle: any = {
        marginHorizontal: (sizes.screens.width - 200) / 2,
        width: 200,
        alignSelf: "center",
        bottom: sizes.margins["1xl"],
        borderRadius: (sizes.bottomTab.height * 1.4) / 2,
        height: sizes.bottomTab.height * 1,
        borderTopWidth: 0,
        elevation: 0,
        position: "absolute",
        backgroundColor: backgroundDisabled,
    }

    const titleStyle: any = {
        marginHorizontal: sizes.margins["2sm"],
        color: background,
        fontSize: fonts.size.body,
        fontFamily: fonts.family.Bold,
    }

    return (
        <BottomTab.Navigator
            initialRouteName="Moment"
            screenOptions={{
                tabBarHideOnKeyboard: true,
                headerShown: false,
                tabBarStyle: tabBarStyle,
                tabBarShowLabel: false, // Remove os labels
                lazy: true,
            }}
        >
            {/* Tela de Moments */}
            <BottomTab.Screen
                name="Moment"
                component={MomentNavigator}
                initialParams={{ screen: "NewMomentVideoScreen" }} // Parâmetro inicial para tela específica
                options={{
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <View style={focusedTabStyle(!!isDarkMode)}>
                                <Moment
                                    fill={String(background)}
                                    width={iconWidth}
                                    height={iconHeight}
                                />
                                <Text style={titleStyle}>Moment</Text>
                            </View>
                        ) : (
                            <View style={unfocusedTabStyle("left")}>
                                <Moment fill={String(icon)} width={iconWidth} height={iconHeight} />
                            </View>
                        ),
                }}
            />
            {/* Tela de Memories */}
            <BottomTab.Screen
                name="Memory"
                component={MemoriesNavigator}
                initialParams={{ screen: "NewMemorySelectMoments" }}
                options={{
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <View style={focusedTabStyle(!!isDarkMode)}>
                                <Text style={titleStyle}>Memory</Text>
                                <Memory
                                    fill={String(background)}
                                    width={iconWidth - 2}
                                    height={iconHeight - 2}
                                />
                            </View>
                        ) : (
                            <View style={unfocusedTabStyle("right")}>
                                <Memory
                                    fill={String(icon)}
                                    width={iconWidth - 2}
                                    height={iconHeight - 2}
                                />
                            </View>
                        ),
                }}
            />
        </BottomTab.Navigator>
    )
}
