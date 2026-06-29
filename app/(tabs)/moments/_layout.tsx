import { Stack } from "expo-router"
import React from "react"
import config from "@/config"
import Fonts from "@/constants/fonts"
import { colors } from "@/constants/colors"
export default function MomentsLayout() {
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
                    headerTitle: config.APPLICATION_NAME,
                }}
            />
        </Stack>
    )
}
