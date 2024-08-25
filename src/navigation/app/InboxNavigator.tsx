import HeaderLeft from "@/components/headers/inbox/inbox-header_left"
import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useColorScheme } from "react-native"
import LanguageContext from "../../contexts/Preferences/language"
import ColorTheme from "../../layout/constants/colors"
import Sizes from "../../layout/constants/sizes"
import InboxScreen from "../../pages/app/Inbox"
import { Interpolation as HorizontalLeft } from "../transitions/horizontal-left"

const InboxStack = createStackNavigator()

export function InboxNavigator() {
    const { t } = React.useContext(LanguageContext)
    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    const isDarkMode = useColorScheme() === "dark"

    return (
        <InboxStack.Navigator
            screenOptions={{
                cardStyleInterpolator: HorizontalLeft,
            }}
        >
            <InboxStack.Screen
                name="Inbox"
                component={InboxScreen}
                options={{
                    headerTitle: t("Notifications"),
                    headerStyle: [HeaderStyle],
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <HeaderLeft />,
                }}
            />
        </InboxStack.Navigator>
    )
}
