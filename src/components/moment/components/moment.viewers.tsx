import React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"
import Eye from "@/assets/icons/svgs/eye.svg"
import { colors } from "@/constants/colors"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import PersistedContext from "@/contexts/Persisted"
import FeedContext from "@/contexts/Feed"
import MomentContext from "../context"

/**
 * Abre/fecha o painel de "quem viu este moment", ao lado do like.
 *
 * Só aparece para o dono: `GET /moments/:id/viewers` responde 403 para
 * qualquer outra pessoa, então o botão nem existe fora da própria conta.
 *
 * O estado mora no FeedContext porque quem anima o card é a tela que o
 * renderiza, não este botão.
 */
export function ViewersIOS({ size }: { size?: number }) {
    const { session } = React.useContext(PersistedContext)
    const { viewersMomentId, setViewersMomentId } = React.useContext(FeedContext)
    const { data } = React.useContext(MomentContext)

    const momentId = data?.id ? String(data.id) : ""
    const isOwner =
        !!momentId && String(data?.user?.id || "") === String(session.account.userId || "")

    const isOpen = viewersMomentId === momentId

    if (!isOwner) return null

    function handlePress() {
        Vibrate("effectClick")
        setViewersMomentId(isOpen ? null : momentId)
    }

    // Mesma geometria do like: com `size` vira círculo, sem ele fica a pílula
    // padrão, para os dois botões alinharem na mesma linha.
    const buttonStyle = size
        ? {
              width: size,
              height: size,
              borderRadius: size / 2,
              alignItems: "center" as const,
              justifyContent: "center" as const,
              overflow: "hidden" as const,
          }
        : styles.button
    const iconSize = size ? Math.round(size * 0.48) : 22
    const iconColor = isOpen ? colors.gray.white : colors.gray.grey_01

    return (
        <Pressable
            onPress={handlePress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Viewers"
            accessibilityState={{ expanded: isOpen }}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
            {isLiquidGlassAvailable() ? (
                <GlassView
                    glassEffectStyle="regular"
                    isInteractive
                    colorScheme="dark"
                    tintColor={isOpen ? colors.gray.white + "30" : undefined}
                    style={buttonStyle}
                >
                    <SymbolView
                        name="eye.fill"
                        size={iconSize}
                        tintColor={iconColor}
                        fallback={<Eye width={iconSize} height={iconSize} fill={iconColor} />}
                    />
                </GlassView>
            ) : (
                <View style={[buttonStyle, styles.fallback]}>
                    <SymbolView
                        name="eye.fill"
                        size={iconSize}
                        tintColor={iconColor}
                        fallback={<Eye width={iconSize} height={iconSize} fill={iconColor} />}
                    />
                </View>
            )}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        width: 60,
        height: 46,
        borderRadius: 23,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    fallback: {
        backgroundColor: colors.gray.grey_08 + "cc",
    },
})
