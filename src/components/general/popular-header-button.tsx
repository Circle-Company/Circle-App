import React from "react"
import { Pressable } from "react-native"
import { SymbolView } from "expo-symbols"
import { useRouter } from "expo-router"

import { colors } from "@/constants/colors"
import PersonIcon from "@/assets/icons/svgs/person.svg"

/**
 * Botão de "populares na sua região" usado como headerLeft da câmera — o
 * espelho do sino de notificações, que vive no headerRight.
 */
export function PopularHeaderButton() {
    const router = useRouter()
    const size = 22

    return (
        <Pressable
            onPress={() => router.push("/popular")}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            accessibilityRole="button"
            accessibilityLabel="Popular nearby"
        >
            <SymbolView
                name="person.badge.plus"
                tintColor={colors.gray.white}
                size={size}
                // Não há asset de "adicionar usuário" no projeto; o fallback é
                // o person.svg, ícone de gente já usado no resto do app.
                fallback={
                    <PersonIcon width={size + 2} height={size + 2} fill={colors.gray.white} />
                }
            />
        </Pressable>
    )
}
