import { Stack } from "expo-router"
import React from "react"
import ColorTheme from "@/constants/colors"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"

export default function AuthLayout() {
    const { t } = React.useContext(LanguageContext)

    const HeaderStyle = {
        ...sizes.headers,
        backgroundColor: ColorTheme().background,
    }

    const CardStyle = {
        borderRadius: 40,
        backgroundColor: String(ColorTheme().background),
        paddingTop: sizes.paddings["1sm"],
    }

    return (
        <Stack
            screenOptions={{
                contentStyle: { backgroundColor: String(ColorTheme().background) },
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="init"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="sign-in"
                options={{
                    headerShown: false,
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                }}
            />
            <Stack.Screen
                name="sign-up-username"
                options={{
                    headerShown: false,
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                }}
            />
            <Stack.Screen
                name="sign-up-password"
                options={{
                    headerShown: false,
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                }}
            />
            <Stack.Screen
                name="sign-up-agree"
                options={{
                    headerShown: false,
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                }}
            />
        </Stack>
    )
}
