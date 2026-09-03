import PersistedContext from "@/contexts/Persisted"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"
import React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import MomentContext from "../context"
import { colors } from "@/constants/colors"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { Text } from "@/components/Themed"

export function likeIOS({ isLiked, size }: { isLiked: boolean; size?: number }) {
    const { session } = React.useContext(PersistedContext)
    const { data, actions, options } = React.useContext(MomentContext)
    const momentId = React.useMemo(() => (data.id ? String(data.id) : ""), [data.id])

    // Fonte única do estado: a lista persistida na conta. Como é uma store
    // Zustand, curtir no feed já reflete no perfil e no detalhe do momento,
    // e o estado sobrevive ao fechamento do app.
    const likedMoments = Array.isArray(session.account.likedMoments)
        ? session.account.likedMoments
        : []
    const liked = momentId ? likedMoments.includes(momentId) : false

    // Um toque do usuário sempre vence a semeadura vinda do servidor — sem
    // isso, um payload antigo com `isLiked: true` desfaria o unlike.
    const userActedRef = React.useRef(false)
    React.useEffect(() => {
        userActedRef.current = false
    }, [momentId])

    // Semeia a partir da verdade do servidor quando ela chega (pode chegar
    // depois da montagem, já que o DataStore é preenchido num efeito).
    const serverLiked = Boolean(isLiked || data.isLiked || actions.like)
    React.useEffect(() => {
        if (!momentId || userActedRef.current || !serverLiked) return
        session.account.addLikedMoment(momentId)
    }, [momentId, serverLiked])

    // As guardas de LIKE/UNLIKE em `registerInteraction` dependem de
    // `actions.like`. Ao abrir o perfil, esse estado nasce `false` mesmo para
    // um momento já curtido — sem alinhar aqui, o UNLIKE seria descartado
    // antes de chegar na API e o like ficaria órfão no servidor.
    React.useEffect(() => {
        if (liked && !actions.like) actions.setLike(true)
    }, [liked, actions.like])

    async function onLikeAction() {
        userActedRef.current = true
        session.account.addLikedMoment(momentId)
        Vibrate("effectHeavyClick")
        const ok = await actions.registerInteraction("LIKE", {
            momentId: data.id,
            authorizationToken: session.account.jwtToken,
        })
        if (!ok) {
            // `registerInteraction` engole os erros da API, então o retorno é
            // o único sinal de falha — reverte o otimismo.
            session.account.removeLikedMoment(momentId)
            Vibrate("notificationError")
        }
    }

    async function onUnlikeAction() {
        userActedRef.current = true
        session.account.removeLikedMoment(momentId)
        Vibrate("effectHeavyClick")
        const ok = await actions.registerInteraction("UNLIKE", {
            momentId: data.id,
            authorizationToken: session.account.jwtToken,
        })
        if (!ok) {
            session.account.addLikedMoment(momentId)
            Vibrate("notificationError")
        }
    }

    async function handlePress() {
        if (!momentId) return
        if (liked) await onUnlikeAction()
        else await onLikeAction()
    }

    if (!options.enableLike) return null

    const heartColor = liked ? colors.gray.white : colors.gray.grey_01

    // Com `size` → botão redondo (círculo size×size). Sem `size` → o padrão
    // (pílula 60×46). Usado para deixar o like redondo no grid do perfil.
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

    return (
        <Pressable
            onPress={handlePress}
            disabled={!options.enableLike}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityState={{ selected: liked }}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
            {isLiquidGlassAvailable() ? (
                <GlassView
                    colorScheme="dark"
                    glassEffectStyle="regular"
                    isInteractive
                    colorScheme="dark"
                    tintColor={liked ? colors.red.red_05 : undefined}
                    style={buttonStyle}
                >
                    <SymbolView name="heart.fill" size={iconSize} tintColor={heartColor} />
                </GlassView>
            ) : (
                <View style={[buttonStyle, styles.fallback]}>
                    <SymbolView name="heart.fill" size={iconSize} tintColor={heartColor} />
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
