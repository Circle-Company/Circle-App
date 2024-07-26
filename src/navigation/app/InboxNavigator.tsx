import { createStackNavigator } from "@react-navigation/stack"
import React from "react"
import { useColorScheme } from "react-native"
import MemoriesHeaderLeft from "../../components/headers/memories/#"
import LanguageContext from "../../contexts/Preferences/language"
import ColorTheme, { colors } from "../../layout/constants/colors"
import Sizes from "../../layout/constants/sizes"
import InboxScreen from "../../pages/app/Inbox"
import { Interpolation as Horizontal } from "../transitions/horizontal"

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
                cardStyleInterpolator: Horizontal,
            }}
        >
            <InboxStack.Screen
                name="Inbox"
                component={InboxScreen}
                options={{
                    headerTitle: t("Inbox"),
                    headerStyle: [
                        HeaderStyle,
                        {
                            borderBottomWidth: 1,
                            borderColor: isDarkMode ? colors.gray.grey_08 : colors.gray.grey_02,
                        },
                    ],
                    headerTintColor: String(ColorTheme().text),
                    cardStyle: { backgroundColor: String(ColorTheme().background) },
                    cardOverlayEnabled: true,
                    headerLeft: () => <MemoriesHeaderLeft />,
                }}
            />
        </InboxStack.Navigator>
    )
}
