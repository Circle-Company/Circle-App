import { Stack } from "expo-router"
import React from "react"
import { Platform } from "react-native"
import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/Preferences/language"
import PersistedContext from "@/contexts/Persisted"
import AccountHeaderRight from "@/components/headers/account/account-header_right"

export default function YouLayout() {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)

    const HeaderStyle = {
        borderBottomWidth: 0,
        backgroundColor: colors.gray.black,
    }

    return (
        <Stack
            screenOptions={{
                statusBarAnimation: "fade",
                statusBarStyle: "light",
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerStyle: HeaderStyle,
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                    },
                    headerTitleAlign: "center",
                    headerBlurEffect: "dark",
                    headerRight: AccountHeaderRight,
                    headerTintColor: colors.gray.white,
                    headerTitle: "@" + session?.user?.username || "",
                }}
            />
            <Stack.Screen
                name="edit"
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
        </Stack>
    )
}
