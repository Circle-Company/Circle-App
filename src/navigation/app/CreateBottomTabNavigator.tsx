import ColorTheme, { colors } from "../../constants/colors"
import { Text, View, useColorScheme } from "react-native"

import { CameraModule } from "@/modules/camera"
import Memory from "../../assets/icons/svgs/memory.svg"
import Moment from "../../assets/icons/svgs/bolt.svg"
import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import fonts from "../../constants/fonts"
import sizes from "../../constants/sizes"

const BottomTab = createBottomTabNavigator()

const focusedTabStyle = (isDarkMode: boolean) => ({
    paddingLeft: 9,
    width: 120,
    borderRadius: (sizes.bottomTab.height * 1.2) / 2,
    height: sizes.bottomTab.height * 0.6,
    backgroundColor: isDarkMode ? colors.gray.grey_03 : colors.gray.black,
    flexDirection: "row" as const,
    alignItems: "center" as const,
})

const unfocusedTabStyle = (side: "left" | "right") => ({
    marginLeft: side === "left" ? -20 : undefined,
    marginRight: side === "right" ? -20 : undefined,
})

export default function CreateBottomTabNavigator() {
    const isDarkMode = useColorScheme()
    const { icon, background, backgroundDisabled } = ColorTheme()
    const iconWidth = 18
    const iconHeight = 18

    const tabBarStyle: any = {
        width: 140,
        left: (sizes.window.width - 140 + 20) / 2,
        position: "absolute",
        top: 35, // distância do topo
        borderRadius: sizes.bottomTab.height / 2,
        height: sizes.bottomTab.height * 0.6,
        borderTopWidth: 0,
        backgroundColor: backgroundDisabled,
        paddingTop: 2.5,
    }

    const titleStyle: any = {
        marginHorizontal: sizes.margins["2sm"],
        color: background,
        fontSize: fonts.size.body,
        fontFamily: fonts.family["Black-Italic"],
    }

    return (
        <BottomTab.Navigator
            initialRouteName="Moment"
            screenOptions={{
                tabBarHideOnKeyboard: true,
                headerShown: false,
                tabBarStyle: tabBarStyle,
                tabBarShowLabel: false, // Remove os labels
            }}
        >
            {/* Tela de Moments */}
            <BottomTab.Screen
                name="Moment"
                component={CameraModule}
                initialParams={{ screen: "NewMomentCameraModule" }} // Parâmetro inicial para tela específica
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
        </BottomTab.Navigator>
    )
}
