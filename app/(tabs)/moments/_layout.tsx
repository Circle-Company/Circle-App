import { Stack } from "expo-router"
import React from "react"
import { Platform } from "react-native"
import config from "@/config"
import ColorTheme from "@/constants/colors"
import Fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
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
                headerTransparent: false,
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: colors.gray.black,
                },

                headerTintColor: colors.gray.white,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerTitle: config.APPLICATION_NAME,
                    headerTitleAlign: "center",
                    animation: "slide_from_right",
                    headerTintColor: "white",
                    headerLargeTitle: false,
                    headerTransparent: true,
                    headerTitleStyle: { fontFamily: Fonts.family["Black-Italic"] },
                    headerLargeTitleStyle: { fontFamily: Fonts.family["Black-Italic"] },
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                }}
            />
        </Stack>
    )
}
