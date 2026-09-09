import { Stack } from "expo-router"
import React from "react"
import ColorTheme from "@/constants/colors"

export default function AuthLayout() {
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
