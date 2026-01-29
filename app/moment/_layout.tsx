import { router, Stack } from "expo-router"
import React from "react"
import ColorTheme, { colors } from "@/constants/colors"
import Sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { HeaderBackButton } from "@react-navigation/elements"
import fonts from "@/constants/fonts"

export default function MomentLayout() {
    const { t } = React.useContext(LanguageContext)

    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: colors.gray.black,
    }

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
                name="[id]"
                options={{
                    headerTitle: "Moment",
                    headerTitleAlign: "center",
                    animation: "slide_from_right",
                    headerTintColor: "white",
                    headerLargeTitle: false,
                    headerTransparent: true,
                    headerTitleStyle: { fontFamily: fonts.family["Black-Italic"] },
                    headerLargeTitleStyle: { fontFamily: fonts.family["Black-Italic"] },
                    headerStyle: {
                        backgroundColor: "transparent",
                    },
                    headerBackTitle: t("Back"),
                    headerBackVisible: true,
                }}
            />
            <Stack.Screen
                name="camera"
                options={{
                    headerShown: false,
                    headerStyle: HeaderStyle,
                    headerTitleStyle: { color: String(ColorTheme().text) },
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
        </Stack>
    )
}
