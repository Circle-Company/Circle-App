import { Stack, useRouter } from "expo-router"
import React from "react"

import ColorTheme, { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"

export default function InboxLayout() {
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
                headerLargeTitle: false,
                headerTransparent: true,
                headerTitleStyle: { fontFamily: Fonts.family["Black-Italic"] },
                headerLargeTitleStyle: { fontFamily: Fonts.family["Black-Italic"] },
                headerStyle: {
                    backgroundColor: "transparent",
                },
            }}
        >
            <Stack.Screen name="index" options={{ headerTitle: t("Inbox") }} />
        </Stack>
    )
}
