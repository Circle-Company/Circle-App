import { Stack, useRouter } from "expo-router"
import React from "react"

import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/Preferences/language"

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
                onPress={() => router.back()}
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
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="profile-picture"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Add Profile Picture"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="description"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Add Description"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="followings"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Following"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="name"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Name"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="password"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Password"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="privacy-policy"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Privacy Policy"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="terms-of-service"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Terms of Service"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="community-guidelines"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Community Guidelines"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="push-notifications"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Push Notifications"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="all-moments"
                options={{
                    ...defaultOptions,
                    headerTitle: t("All Moments"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="preferences"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Preferences"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="language"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Language"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="content"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Content"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="haptics"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Haptic Feedback"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="open-source"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Open Source"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="support"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Support"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="version"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Version"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="log-out"
                options={{
                    ...defaultOptions,
                    headerTitle: t("Log Out"),
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
        </Stack>
    )
}
