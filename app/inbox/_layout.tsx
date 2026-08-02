import { router, Stack } from "expo-router"
import React from "react"

import { colors } from "@/constants/colors"
import Fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"
import { HeaderBackButton } from "@/components/general/header-buttons"

export default function InboxLayout() {
    const { t } = React.useContext(LanguageContext)

    return (
        <Stack
            screenOptions={{
                contentStyle: { backgroundColor: colors.gray.black },
                headerShadowVisible: false,
                animationMatchesGesture: true,
                animation: "slide_from_right",
                gestureEnabled: true,
                headerBackTitle: t("Back"),
                // Opaco: com `headerTransparent` a lista era desenhada por baixo
                // do header e os primeiros itens ficavam encobertos.
                headerTransparent: false,
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
                    headerLargeTitle: false,
                    headerTransparent: false,
                    headerStyle: {
                        backgroundColor: colors.gray.black,
                    },
                    headerTitleStyle: {
                        fontFamily: Fonts.family["Black-Italic"],
                        fontSize: Fonts.size.title2 * 0.9,
                        color: colors.gray.white,
                    },
                    headerTitle: t("Inbox"),
                    // `index` é a primeira tela deste Stack aninhado, então o
                    // React Navigation não desenha back button automático —
                    // o push veio do stack raiz. Daí o botão explícito.
                    headerLeft: () => (
                        <HeaderBackButton
                            tintColor={colors.gray.white}
                            displayMode="default"
                            label={t("Back")}
                            pressColor={colors.purple.purple_05}
                            onPress={() => router.back()}
                        />
                    ),
                }}
            />
        </Stack>
    )
}
