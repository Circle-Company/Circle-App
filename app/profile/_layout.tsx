import { Stack } from "expo-router"
import React from "react"
import ColorTheme from "@/constants/colors"

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                statusBarStyle: "light",
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: String(ColorTheme().background),
                },
            }}
        >
            <Stack.Screen
                name="[userId]"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    )
}
