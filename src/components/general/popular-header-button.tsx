import React from "react"
import { Pressable } from "react-native"
import { SymbolView } from "expo-symbols"
import { useRouter } from "expo-router"

import { colors } from "@/constants/colors"
import DotRadiowaves from "@/assets/icons/svgs/dot_radiowaves_left_and_right.svg"

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
                name="dot.radiowaves.left.and.right"
                tintColor={colors.gray.white}
                size={size}
                fallback={
                    <DotRadiowaves width={size + 2} height={size + 2} fill={colors.gray.white} />
                }
            />
        </Pressable>
    )
}
