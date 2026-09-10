import { Stack } from "expo-router"
import React from "react"

import Fonts from "@/constants/fonts"
import { colors } from "@/constants/colors"
import LanguageContext from "@/contexts/language"

export default function ChatLayout() {
    const { t } = React.useContext(LanguageContext)

    return (
        <Stack
            screenOptions={{
                contentStyle: {
                    backgroundColor: colors.gray.black,
                },
                statusBarAnimation: "fade",
                statusBarStyle: "light",
                headerShadowVisible: false,
                animationMatchesGesture: true,
                animation: "slide_from_right",
                headerTransparent: true,
                headerStyle: {
                    backgroundColor: colors.gray.black,
                },
                headerTintColor: colors.gray.white,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerStyle: { backgroundColor: "transparent" },
                    headerTitleAlign: "center",
                    headerLargeTitle: false,
                    headerTransparent: true,
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                        color: colors.gray.white,
                    },
                    headerTitle: t("Chat"),
                }}
            />
            <Stack.Screen
                name="[cid]"
                options={{
                    // Mesmo header da tela de account: fundo transparente e título em
                    // `Black-Italic` no `title2 * 0.9`, centralizado.
                    headerStyle: { backgroundColor: "transparent" },
                    headerTransparent: true,
                    headerTitleAlign: "center",
                    headerLargeTitle: false,
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                        color: colors.gray.white,
                    },
                    // Só o chevron, sem o título da tela anterior ao lado. No iOS o default
                    // é `"default"`, que escreve "Chat" junto do ícone; nas outras
                    // plataformas `"minimal"` já é o padrão.
                    headerBackButtonDisplayMode: "minimal",
                }}
            />
        </Stack>
    )
}
