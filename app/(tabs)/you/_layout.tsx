import { Stack, useRouter } from "expo-router"
import React from "react"
import { Pressable } from "react-native"
import { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/Preferences/language"
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
                statusBarAnimation: "fade",
                statusBarStyle: "light",
                headerTransparent: false,
                headerBlurEffect: "systemUltraThinMaterialDark",
                headerStyle: {
                    backgroundColor: colors.gray.black,
                },

                headerTintColor: colors.gray.white,
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerTitleAlign: "center",
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                        color: colors.gray.white,
                    },
                    headerRight: () => (
                        <Pressable
                            onPress={() => router.push("/settings")}
                            hitSlop={8}
                            style={{
                                paddingHorizontal: 8,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Cog fill={String(colors.gray.white)} width={20} height={20} />
                        </Pressable>
                    ),
                    headerTitle: session?.user?.username ? `@${session.user.username}` : "",
                }}
            />

            <Stack.Screen
                name="edit"
                options={{
                    headerTitle: t("Edit"),
                    headerTitleAlign: "left",
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2,
                        color: colors.gray.white,
                    },
                }}
            />
        </Stack>
    )
}
