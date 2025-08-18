import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import ColorTheme from "../../constants/colors"
import Sizes from "../../constants/sizes"
import LanguageContext from "../../contexts/Preferences/language"
import ExploreScreen from "../../pages/app/Explore"
import { Interpolation as Horizontal } from "../transitions/horizontal-right"

const ExploreStack = createStackNavigator()

export function ExploreScreenNavigator() {
    const { t } = React.useContext(LanguageContext)
    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    return (
        <ExploreStack.Navigator screenOptions={{ cardStyleInterpolator: Horizontal }}>
            <ExploreStack.Screen
                name="ExploreScreen"
                component={ExploreScreen}
                options={{
                    headerTitle: t("Explore"),
                    headerStyle: HeaderStyle,
                    headerShown: false,
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                }}
            />
        </ExploreStack.Navigator>
    )
}
