import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack"
import React from "react"
import LanguageContext from "../../contexts/Preferences/language"
import ColorTheme from "../../layout/constants/colors"
import Sizes from "../../layout/constants/sizes"
import ExploreScreen from "../../pages/app/Explore"

const ExploreStack = createStackNavigator()

export function ExploreScreenNavigator() {
    const { t } = React.useContext(LanguageContext)
    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    return (
        <ExploreStack.Navigator
            screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS }}
        >
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
