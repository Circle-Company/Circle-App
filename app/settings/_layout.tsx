import { router, Stack } from "expo-router"
import React from "react"

import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { HeaderBackButton } from "@/components/general/header-buttons"

import fonts from "@/constants/fonts"
import navigation from "@/lib/navigation"
import { View } from "react-native"

export default function SettingsLayout() {
    const { t } = React.useContext(LanguageContext)

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
                        backgroundColor: colors.gray.black,
                    },
                    headerTitleAlign: "center",
                    headerLargeTitle: false,
                    // Opaco: com `headerTransparent` a lista era desenhada por
                    // baixo do header e os primeiros itens ficavam encobertos.
                    headerTransparent: false,
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                        color: colors.gray.white,
                    },
                    headerTitle: t("Settings"),
                    // `index` é a primeira tela deste Stack aninhado, então o
                    // React Navigation não desenha back button automático —
                    // o push veio do stack raiz. Daí o botão explícito.
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            label={t("Back")}
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
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
                name="content"
                options={{
                    headerTransparent: false,
                    headerTitle: t("Content"),
                }}
            />
            <Stack.Screen
                name="blocked-users"
                options={{
                    headerStyle: {
                        backgroundColor: colors.gray.black,
                    },
                    // Mesma correção: a FlatList de bloqueados ficava por baixo
                    // do header. O back button aqui já é o automático do Stack.
                    headerTransparent: false,
                    headerTitle: t("Blocked Users"),
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
