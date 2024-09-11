import PersistedContext from "@/contexts/Persisted"
import fonts from "@/layout/constants/fonts"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import React, { useContext } from "react"
import { Text, View } from "react-native"
import Moment from "../../assets/icons/svgs/bolt.svg" // Import de SVGs
import Memory from "../../assets/icons/svgs/memory.svg"
import LanguageContext from "../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../layout/constants/colors"
import sizes from "../../layout/constants/sizes"
import { MemoriesNavigator } from "./MemoriesNavigator"
import { MomentNavigator } from "./MomentNavigator" // Importação de suas telas

const BottomTab = createBottomTabNavigator()

export default function CreateBottomTabNavigator() {
    const { t } = useContext(LanguageContext)
    const { session } = useContext(PersistedContext)
    const { iconFocused, icon, background, backgroundDisabled, text } = ColorTheme() // Desestruturação de temas
    const iconWidth = 24
    const iconHeight = 24

    // Customização da TabBar
    const tabBarStyle: any = {
        width: 200,
        alignSelf: "center",
        bottom: sizes.margins["1xl"],
        borderRadius: (sizes.bottomTab.height * 1.4) / 2,
        height: sizes.bottomTab.height * 1,
        borderTopWidth: 0,
        elevation: 0,
        backgroundColor: backgroundDisabled + 90,
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
            }}
        >
            {/* Tela de Moments */}
            <BottomTab.Screen
                name="Moment"
                component={MomentNavigator}
                initialParams={{ screen: "NewMomentImageScreen" }} // Parâmetro inicial para tela específica
                options={{
                    tabBarIcon: ({ focused }) =>
                        focused ? (
                            <View
                                style={{
                                    right: -20,
                                    paddingLeft: 20,
                                    width: 140,
                                    borderRadius: (sizes.bottomTab.height * 1.2) / 2,
                                    flex: 1,
                                    backgroundColor: colors.gray.white,
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Moment
                                    fill={String(background)}
                                    width={iconWidth}
                                    height={iconHeight}
                                />
                                <Text style={titleStyle}>Moment</Text>
                            </View>
                        ) : (
                            <View style={{ left: -20 }}>
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
                            <View
                                style={{
                                    left: -20,
                                    paddingLeft: 12,
                                    width: 140,
                                    borderRadius: (sizes.bottomTab.height * 1.2) / 2,
                                    flex: 1,
                                    backgroundColor: colors.gray.white,
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={titleStyle}>Memory</Text>
                                <Memory
                                    fill={String(background)}
                                    width={iconWidth - 2}
                                    height={iconHeight - 2}
                                />
                            </View>
                        ) : (
                            <View style={{ right: -20 }}>
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
