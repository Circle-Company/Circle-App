import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import HeaderRigthHome from "../../components/headers/home/Right"
import config from "../../config"
import ColorTheme from "../../layout/constants/colors"
import Fonts from "../../layout/constants/fonts"
import Sizes from "../../layout/constants/sizes"
import HomeScreen from "../../pages/app/Home"
import { Interpolation as Horizontal } from "../transitions/horizontal-right"

const HomeScreenStack = createStackNavigator()

export function HomeScreenNavigator() {
    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    return (
        <HomeScreenStack.Navigator screenOptions={{ cardStyleInterpolator: Horizontal }}>
            <HomeScreenStack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{
                    headerTitle: config.APPLICATION_SHORT_NAME,
                    headerTitleAlign: "left",
                    headerTransparent: false,
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2,
                    },
                    headerTintColor: String(ColorTheme().text),
                    headerStyle: HeaderStyle,
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    headerRight: () => <HeaderRigthHome />,
                }}
            />
        </HomeScreenStack.Navigator>
    )
}
