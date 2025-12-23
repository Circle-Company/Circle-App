import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"
import { Platform } from "react-native"
import AccountHeaderCenter from "../../components/headers/account/account-header_center"
import AccountHeaderRight from "../../components/headers/account/account-header_right"
import ColorTheme, { colors } from "../../constants/colors"
import Fonts from "../../constants/fonts"
import Sizes from "../../constants/sizes"
import LanguageContext from "../../contexts/Preferences/language"
import PersistedContext from "@/contexts/Persisted"
import AccountScreen from "../../pages/app/Account"
import { Interpolation as Horizontal } from "../transitions/horizontal-right"
import sizes from "../../constants/sizes"
import { border, onLongPressGesture } from "@expo/ui/swift-ui/modifiers"
import { BorderlessButton } from "react-native-gesture-handler"

const AccountScreenStack = createNativeStackNavigator()

export function AccountScreenNavigator() {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const HeaderStyle = {
        BorderBottomWidth: 0,
        backgroundColor: ColorTheme().background,
    }

    return (
        <AccountScreenStack.Navigator
            screenOptions={{
                statusBarAnimation: "fade",
                statusBarStyle: "light",
            }}
        >
            <AccountScreenStack.Screen
                name="AccountScreen"
                component={AccountScreen}
                options={{
                    headerStyle: HeaderStyle,
                    scrollEdgeEffects: {
                        bottom: "hard",
                        top: true,
                        left: true,
                        right: true,
                    },
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                    },
                    headerTitleAlign: "center",
                    headerBlurEffect: "dark",
                    sheetExpandsWhenScrolledToEdge: true,
                    headerRight: AccountHeaderRight,
                    headerTintColor: colors.gray.white,
                    headerTitle: "@" + session.user.username,
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
                }}
            />
        </AccountScreenStack.Navigator>
    )
}
