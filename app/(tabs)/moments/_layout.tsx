import { Stack } from "expo-router"
import React from "react"
import { Platform } from "react-native"
import config from "@/config"
import ColorTheme from "@/constants/colors"
import Fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import { colors } from "@/constants/colors"
export default function MomentsLayout() {
    const HeaderStyle = {
        height: sizes.headers.height * 1.12,
        backgroundColor: ColorTheme().background,
        ...(Platform.OS === "android"
            ? { elevation: 0 }
            : { shadowOpacity: 0, borderBottomWidth: 0 }),
    }

    return (
        <Stack
            screenOptions={{
                contentStyle: {
                    backgroundColor: colors.gray.black,
                    marginTop: sizes.margins["2sm"],
                },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerTitle: config.APPLICATION_NAME,
                    headerTitleAlign: "center",
                    headerTransparent: false,
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                    },
                    headerStyle: HeaderStyle,
                    headerTintColor: String(ColorTheme().text),
                }}
            />
        </Stack>
    )
}
