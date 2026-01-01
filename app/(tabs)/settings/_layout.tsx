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
                contentStyle: { backgroundColor: String(ColorTheme().background) },
                headerShadowVisible: false,
                animation: "slide_from_right",
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
                headerBackTitle: t("Back"),
                headerTintColor: "white",
                headerTitleStyle: { fontFamily: Fonts.family["Black-Italic"] },
                headerStyle: {
                    backgroundColor: "black",
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerTitle: t("Settings"),
                    headerTintColor: "white",
                    headerTitleStyle: { fontFamily: fonts.family["Black-Italic"] },
                    headerStyle: {
                        backgroundColor: "black",
                    },
                    headerLeft: () => (
                        <HeaderBackButton
                            onPress={() => navigation.replace("/(tabs)/you")}
                            tintColor="white"
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="profile-picture"
                options={{
                    headerTitle: t("Add Profile Picture"),
                }}
            />
            <Stack.Screen
                name="description"
                options={{
                    headerTitle: t("Add Description"),
                }}
            />
            <Stack.Screen
                name="followings"
                options={{
                    headerTitle: t("Following"),
                }}
            />
            <Stack.Screen
                name="name"
                options={{
                    headerTitle: t("Name"),
                }}
            />
            <Stack.Screen
                name="password"
                options={{
                    headerTitle: t("Password"),
                }}
            />
            <Stack.Screen
                name="privacy-policy"
                options={{
                    headerTitle: t("Privacy Policy"),
                }}
            />
            <Stack.Screen
                name="terms-of-service"
                options={{
                    headerTitle: t("Terms of Service"),
                }}
            />
            <Stack.Screen
                name="community-guidelines"
                options={{
                    headerTitle: t("Community Guidelines"),
                }}
            />
            <Stack.Screen
                name="push-notifications"
                options={{
                    headerTitle: t("Push Notifications"),
                }}
            />
            <Stack.Screen
                name="all-moments"
                options={{
                    headerTitle: t("All Moments"),
                }}
            />
            <Stack.Screen
                name="preferences"
                options={{
                    headerTitle: t("Preferences"),
                }}
            />
            <Stack.Screen
                name="language"
                options={{
                    headerTitle: t("Language"),
                }}
            />
            <Stack.Screen
                name="content"
                options={{
                    headerTitle: t("Content"),
                }}
            />
            <Stack.Screen
                name="haptics"
                options={{
                    headerTitle: t("Haptic Feedback"),
                }}
            />
            <Stack.Screen
                name="open-source"
                options={{
                    headerTitle: t("Open Source"),
                }}
            />
            <Stack.Screen
                name="support"
                options={{
                    headerTitle: t("Support"),
                }}
            />
            <Stack.Screen
                name="version"
                options={{
                    headerTitle: t("Version"),
                }}
            />
            <Stack.Screen
                name="log-out"
                options={{
                    headerTitle: t("Log Out"),
                }}
            />
        </Stack>
    )
}
