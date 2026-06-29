import { Stack, useRouter } from "expo-router"
import React from "react"

import { colors } from "@/constants/colors"
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
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                    headerTitleAlign: "center",
                    headerLargeTitle: false,
                    headerTransparent: true,
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                        color: colors.gray.white,
                    },
                    headerTitle: t("Inbox"),
                }}
            />
        </Stack>
    )
}
