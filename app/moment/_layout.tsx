import { router, Stack } from "expo-router"
import React from "react"
import ColorTheme, { colors } from "@/constants/colors"
import Sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/Preferences/language"
import MomentFullHeaderLeft from "@/components/headers/moment/moment_full-header_left"
import NewMomentImageRight from "@/components/headers/moment/new_moment_image-header_right"
import NewMomentInputDescriptionRight from "@/components/headers/moment/new_moment_input_description-header_right"
import { Button, HeaderBackButton } from "@react-navigation/elements"

export default function MomentLayout() {
    const { t } = React.useContext(LanguageContext)

    const HeaderStyle = {
        ...Sizes.headers,
        backgroundColor: ColorTheme().background,
    }

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
                name="[id]"
                options={{
                    headerStyle: HeaderStyle,
                    headerTitle: undefined,
                    headerTransparent: true,
                    headerLeft: () => <MomentFullHeaderLeft />,
                    contentStyle: {
                        backgroundColor: colors.gray.black.toString(),
                        overflow: "hidden",
                    },
                }}
            />
            <Stack.Screen
                name="new-camera"
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
