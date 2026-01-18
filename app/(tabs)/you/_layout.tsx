import { Stack, useRouter } from "expo-router"
import React from "react"
import { Pressable } from "react-native"
import { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"
import { iOSMajorVersion } from "@/lib/platform/detection"
import Cog from "@/assets/icons/svgs/cog.svg"

export default function YouLayout() {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const router = useRouter()

    const backgroundColor = colors.gray.black

    return (
        <Stack
            screenOptions={{
                contentStyle: {
                    backgroundColor,
                },
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
                    headerTitle: session?.user?.username ? `@${session.user.username}` : "",
                }}
            />
        </Stack>
    )
}
