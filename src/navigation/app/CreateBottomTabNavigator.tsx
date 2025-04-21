import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import React from "react"
import { View, ViewStyle } from "react-native"
import Moment from "../../assets/icons/svgs/bolt.svg" // Import de SVGs
import Memory from "../../assets/icons/svgs/memory.svg"
import ColorTheme, { colors } from "../../layout/constants/colors"
import sizes from "../../layout/constants/sizes"
import { MemoriesNavigator } from "./MemoriesNavigator"
import { MomentNavigator } from "./MomentNavigator" // Importação de suas telas

const BottomTab = createBottomTabNavigator()

export default function CreateBottomTabNavigator() {
    const { icon } = ColorTheme() // Desestruturação de temas
    const iconWidth = 20
    const iconHeight = 20

    // Customização da TabBar
    const tabBarStyle: ViewStyle = {
        marginHorizontal: (sizes.screens.width - 120) / 2,
        width: 120,
        alignSelf: "center",
        top: sizes.margins["1md"] * 0.7,
        borderRadius: (sizes.bottomTab.height * 1.4) / 2,
        height: sizes.bottomTab.height * 0.6,
        borderTopWidth: 0,
        elevation: 0,
        position: "absolute",
        backgroundColor: colors.gray.grey_07,
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
                initialParams={{ screen: "CameraScreen" }} // Parâmetro inicial para tela específica
                options={{
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <View
                                style={{
                                    paddingLeft: 21,
                                    width: 60,
                                    borderRadius: (sizes.bottomTab.height * 1.2) / 2,
                                    flex: 1,
                                    backgroundColor: colors.gray.white,
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Moment
                                    fill={colors.gray.black}
                                    width={iconWidth - 2}
                                    height={iconHeight - 2}
                                />
                            </View>
                        ) : (
                            <Moment fill={String(icon)} width={iconWidth} height={iconHeight} />
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
                            <View
                                style={{
                                    paddingLeft: 23,
                                    width: 60,
                                    borderRadius: (sizes.bottomTab.height * 1.2) / 2,
                                    flex: 1,
                                    backgroundColor: colors.gray.white,
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Memory
                                    fill={colors.gray.black}
                                    width={iconWidth - 2}
                                    height={iconHeight - 2}
                                />
                            </View>
                        ) : (
                            <Memory
                                fill={String(icon)}
                                width={iconWidth - 2}
                                height={iconHeight - 2}
                            />
                        ),
                }}
            />
        </BottomTab.Navigator>
    )
}
