import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { Platform } from "react-native"
import HeaderRigthHome from "../../components/headers/home/Right"
import config from "../../config"
import ColorTheme from "../../constants/colors"
import Fonts from "../../constants/fonts"
import Sizes from "../../constants/sizes"
import HomeScreen from "../../pages/app/Home"
import { Interpolation as Horizontal } from "../transitions/horizontal-right"
import { height } from "happy-dom/lib/PropertySymbol.js"
import sizes from "../../constants/sizes"

const HomeScreenStack = createStackNavigator()

export function HomeScreenNavigator() {
    const HeaderStyle = {
        height: sizes.headers.height * 1.12,
        ...(Platform.OS === "android"
            ? { elevation: 0 }
            : { shadowOpacity: 0, borderBottomWidth: 0 }),
    }

    return (
        <HomeScreenStack.Navigator
            screenOptions={{
                cardStyleInterpolator: Horizontal,
                cardStyle: {
                    backgroundColor: String(ColorTheme().background),
                    marginTop: sizes.margins["2sm"],
                },
            }}
        >
            <HomeScreenStack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{
                    headerTitle: config.APPLICATION_NAME,
                    headerTitleAlign: "center",
                    headerTransparent: false,
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                    },
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                }}
            />
        </HomeScreenStack.Navigator>
    )
}
