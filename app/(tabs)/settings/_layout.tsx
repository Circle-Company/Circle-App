import { Stack, useRouter } from "expo-router"
import React from "react"

import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"

import { HeaderBackButton } from "@react-navigation/elements"
import fonts from "@/constants/fonts"
import navigation from "@/lib/navigation"
import { View } from "react-native"

export default function SettingsLayout() {
    const { t } = React.useContext(LanguageContext)
    const router = useRouter()

    return (
        <Stack
            screenOptions={{
                contentStyle: { backgroundColor: colors.gray.black },
                headerShadowVisible: false,
                animationMatchesGesture: true,
                animation: "slide_from_right",
                gestureEnabled: true,
                headerBackTitle: t("Back"),
                headerTintColor: "white",
                headerLargeTitleShadowVisible: true,
                headerLargeTitle: false,
                headerTransparent: false,
                headerTitleStyle: { fontFamily: Fonts.family["Black-Italic"] },
                headerLargeTitleStyle: { fontFamily: Fonts.family["Black-Italic"] },
                headerStyle: {
                    backgroundColor: "black",
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                    headerTitle: t("Settings"),
                    headerTransparent: true,
                }}
            />
            <Stack.Screen
                name="profile-picture"
                options={{
                    headerTransparent: false,

                    headerTitle: t("Add Profile Picture"),
                }}
            />
            <Stack.Screen
                name="description"
                options={{
                    headerTransparent: false,

                    headerTitle: t("Add Description"),
                }}
            />
            <Stack.Screen
                name="name"
                options={{
                    headerTransparent: false,

                    headerTitle: t("Name"),
                }}
            />
            <Stack.Screen
                name="password"
                options={{
                    headerTransparent: false,

                    headerTitle: t("Password"),
                }}
            />
            <Stack.Screen
                name="personal-data"
                options={{
                    headerTransparent: false,

                    headerTitle: t("Personal Data"),
                }}
            />
            <Stack.Screen
                name="exclude-account"
                options={{
                    headerTransparent: false,

                    headerTitle: t("Delete Account"),
                }}
            />
            <Stack.Screen
                name="language"
                options={{
                    headerTransparent: false,
                    headerTitle: t("Language"),
                }}
            />
            <Stack.Screen
                name="log-out"
                options={{
                    headerTransparent: false,
                    headerTitle: t("Log Out"),
                }}
            />
        </Stack>
    )
}
