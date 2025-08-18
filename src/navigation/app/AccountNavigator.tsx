import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import AccountHeaderCenter from "../../components/headers/account/account-header_center"
import AccountHeaderRight from "../../components/headers/account/account-header_right"
import ColorTheme from "../../constants/colors"
import Fonts from "../../constants/fonts"
import Sizes from "../../constants/sizes"
import LanguageContext from "../../contexts/Preferences/language"
import AccountScreen from "../../pages/app/Account"
import { Interpolation as Horizontal } from "../transitions/horizontal-right"

const AccountScreenStack = createStackNavigator()

export function AccountScreenNavigator() {
    const { t } = React.useContext(LanguageContext)
    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    return (
        <AccountScreenStack.Navigator
            screenOptions={{
                cardStyleInterpolator: Horizontal,
            }}
        >
            <AccountScreenStack.Screen
                name="AccountScreen"
                component={AccountScreen}
                options={{
                    headerTitleStyle: { display: "none" },
                    headerStyle: HeaderStyle,
                    cardStyle: {
                        backgroundColor: String(ColorTheme().background),
                    },
                    headerTitleAlign: "center",
                    cardOverlayEnabled: true,
                    headerLeft: () => <AccountHeaderCenter />,
                    headerTitle: undefined,
                    headerRight: () => <AccountHeaderRight />,
                }}
            />
            <AccountScreenStack.Screen
                name="EditAccountScreen"
                component={AccountScreen}
                options={{
                    headerTitle: t("Edit"),
                    headerTitleAlign: "left",
                    headerTransparent: false,
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2,
                    },
                    headerTintColor: String(ColorTheme().text),
                    headerStyle: HeaderStyle,
                    cardStyle: {
                        backgroundColor: String(ColorTheme().background),
                    },
                    cardOverlayEnabled: true,
                }}
            />
        </AccountScreenStack.Navigator>
    )
}
