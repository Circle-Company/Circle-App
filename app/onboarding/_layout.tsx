import { Stack } from "expo-router"
import React from "react"

import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import LanguageContext from "@/contexts/language"

export default function OnboardingLayout() {
    const { t } = React.useContext(LanguageContext)

    return (
        <Stack
            screenOptions={{
                presentation: "containedModal",
                contentStyle: { backgroundColor: colors.gray.black },
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.gray.black },
                headerTintColor: colors.gray.white,
                statusBarStyle: "light",
            }}
        >
            <Stack.Screen
                name="profile-picture"
                options={{
                    headerTitleAlign: "center",
                    headerLargeTitle: false,
                    headerTitle: t("Add a profile picture"),
                    headerTitleStyle: {
                        fontFamily: fonts.family["Black-Italic"],
                        fontSize: fonts.size.title3,
                        color: colors.gray.white,
                    },
                    // Etapa do cadastro: sem voltar. A saída é enviar a foto ou
                    // usar o "pular por agora" no rodapé.
                    headerBackVisible: false,
                    gestureEnabled: false,
                }}
            />
        </Stack>
    )
}
