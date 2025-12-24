import { Stack, useRouter } from "expo-router"
import React from "react"
import { Platform } from "react-native"
import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/Preferences/language"
import SettingsHeaderLeft from "@/components/headers/settings/settings-header_left"
import { HeaderBackButton } from "@react-navigation/elements"

export default function SettingsLayout() {
    const { t } = React.useContext(LanguageContext)
    const router = useRouter()

    const HeaderStyle = {
        backgroundColor: "transparent",
    }

    const defaultOptions = {
        headerTitleAlign: "center" as const,
        headerTitleStyle: { fontFamily: Fonts.family["Black-Italic"] },
        headerStyle: HeaderStyle,
        headerShadowVisible: false,
        headerTintColor: String(ColorTheme().text),
        animation: "slide_from_right",
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: String(ColorTheme().background) },
        headerLeft: () => (
            <HeaderBackButton
                tintColor={colors.gray.white}
                displayMode="default"
                pressColor={colors.purple.purple_05}
                onPress={() => router.dismiss()}
            />
        ),
    }

    return (
        <Stack
            screenOptions={{
                statusBarStyle: "light",
                contentStyle: { backgroundColor: String(ColorTheme().background) },
                headerShadowVisible: false,
                animation: "slide_from_right",
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Settings"),
                }}
            />
            <Stack.Screen
                name="profile-picture"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Add Profile Picture"),
                }}
            />
            <Stack.Screen
                name="description"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Add Description"),
                }}
            />
            <Stack.Screen
                name="followings"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Following"),
                }}
            />
            <Stack.Screen
                name="name"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Name"),
                }}
            />
            <Stack.Screen
                name="password"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Password"),
                }}
            />
            <Stack.Screen
                name="privacy-policy"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Privacy Policy"),
                }}
            />
            <Stack.Screen
                name="terms-of-service"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Terms of Service"),
                }}
            />
            <Stack.Screen
                name="community-guidelines"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Community Guidelines"),
                }}
            />
            <Stack.Screen
                name="push-notifications"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Push Notifications"),
                }}
            />
            <Stack.Screen
                name="all-moments"
                options={{
                    ...defaultOptions,
                    headerTitle: t("All Moments"),
                }}
            />
            <Stack.Screen
                name="preferences"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Preferences"),
                }}
            />
            <Stack.Screen
                name="language"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Language"),
                }}
            />
            <Stack.Screen
                name="content"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Content"),
                }}
            />
            <Stack.Screen
                name="haptics"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Haptic Feedback"),
                }}
            />
            <Stack.Screen
                name="open-source"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Open Source"),
                }}
            />
            <Stack.Screen
                name="support"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Support"),
                }}
            />
            <Stack.Screen
                name="version"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Version"),
                }}
            />
            <Stack.Screen
                name="log-out"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Log Out"),
                }}
            />
        </Stack>
    )
}
