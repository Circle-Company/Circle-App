import React from "react"
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    TextStyle,
    View,
    ViewStyle,
} from "react-native"
import {
    GlassContainer,
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from "expo-glass-effect"

import { Text } from "@/components/Themed"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import type { FriendshipRelation } from "@/api/friendship/friendship.types"
import {
    useAcceptFriendRequestMutation,
    useCancelFriendRequestMutation,
    useDeclineFriendRequestMutation,
    useFriendshipStatusQuery,
    useRemoveFriendMutation,
    useSendFriendRequestMutation,
} from "@/queries/friendship"

type FriendButtonProps = {
    userId: string
    username?: string
    /**
     * Relação já conhecida por `GET /users/:id` (`interactions.friendshipStatus`).
     * Serve de estado inicial; a query de status assume a partir daí.
     */
    initialRelation?: FriendshipRelation
}

/**
 * Botão de amizade da tela de perfil. Cobre os cinco estados de `relation`:
 *
 *   none / declined  → [Add friend]      POST   /users/:id/friend-request
 *   pending_outgoing → [Invite sent]     DELETE /users/:id/friend-request
 *   pending_incoming → [Accept][Decline]
 *   friends          → [Friends]         DELETE /users/:id/friend
 *
 * Reconvite após recusa é permitido, por isso `declined` cai no mesmo ramo de
 * `none`. O auto-aceite recíproco salta direto para `friends` — quem trata isso
 * é a mutation de envio, lendo `outcome`/`areFriends` da resposta.
 */
export function FriendButton({ userId, username, initialRelation }: FriendButtonProps) {
    const { t } = React.useContext(LanguageContext)

    const { data: status, isLoading } = useFriendshipStatusQuery(userId)
    const relation: FriendshipRelation = status?.relation ?? initialRelation ?? "none"

    const sendMutation = useSendFriendRequestMutation({ userId })
    const cancelMutation = useCancelFriendRequestMutation({ userId })
    const acceptMutation = useAcceptFriendRequestMutation({ userId })
    const declineMutation = useDeclineFriendRequestMutation({ userId })
    const removeMutation = useRemoveFriendMutation({ userId })

    const isPending =
        sendMutation.isPending ||
        cancelMutation.isPending ||
        acceptMutation.isPending ||
        declineMutation.isPending ||
        removeMutation.isPending

    const shouldUseGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    async function run(fn: () => Promise<unknown>, haptic: Parameters<typeof Vibrate>[0]) {
        if (isPending) return
        try {
            await fn()
            Vibrate(haptic)
        } catch (e: any) {
            const message = e?.response?.data?.error
            if (message) Alert.alert(t("Something went wrong"), String(message))
            console.log("[friendship] action failed", e?.response?.data ?? e)
        }
    }

    function handleSend() {
        run(() => sendMutation.mutateAsync(), "notificationSuccess")
    }

    function handleCancel() {
        Alert.alert(t("Cancel invite"), t("Do you want to cancel your friend invite?"), [
            { text: t("Back"), style: "cancel" },
            {
                text: t("Cancel invite"),
                style: "destructive",
                onPress: () => run(() => cancelMutation.mutateAsync(), "rigid"),
            },
        ])
    }

    function handleAccept() {
        run(() => acceptMutation.mutateAsync(), "notificationSuccess")
    }

    function handleDecline() {
        run(() => declineMutation.mutateAsync(), "rigid")
    }

    function handleUnfriend() {
        Alert.alert(
            username ? t("Unfriend @{{username}}", { username }) : t("Unfriend"),
            t("You will no longer be friends. Neither of you will be notified."),
            [
                { text: t("Cancel"), style: "cancel" },
                {
                    text: t("Unfriend"),
                    style: "destructive",
                    onPress: () => run(() => removeMutation.mutateAsync(), "rigid"),
                },
            ],
        )
    }

    // Sem status ainda e sem dica vinda do perfil: não pisca um botão errado.
    if (isLoading && !initialRelation) return null

    const row: ViewStyle = {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: sizes.margins["2sm"],
    }

    // `Pill` mora fora do componente para não ser recriado (e remontado) a cada
    // render; `loading`/`useGlass` chegam por prop.
    const shared = { loading: isPending, useGlass: shouldUseGlass }

    switch (relation) {
        case "friends":
            return (
                <View style={row}>
                    <Pill
                        {...shared}
                        label={t("Friends")}
                        tone="light"
                        onPress={handleUnfriend}
                        solid={false}
                    />
                </View>
            )

        case "pending_outgoing":
            return (
                <View style={row}>
                    <Pill
                        {...shared}
                        label={t("Invite sent")}
                        tone="light"
                        onPress={handleCancel}
                        solid={false}
                    />
                </View>
            )

        case "pending_incoming":
            return (
                <View style={row}>
                    <Pill
                        {...shared}
                        label={t("Accept")}
                        tone="dark"
                        onPress={handleAccept}
                        solid={true}
                    />
                    <Pill
                        {...shared}
                        label={t("Decline")}
                        tone="light"
                        onPress={handleDecline}
                        solid={false}
                    />
                </View>
            )

        // `declined` também cai aqui: reconvite é permitido e imediato.
        case "none":
        case "declined":
        default:
            return (
                <View style={row}>
                    <Pill
                        {...shared}
                        label={t("Add friend")}
                        tone="dark"
                        onPress={handleSend}
                        solid={true}
                    />
                </View>
            )
    }
}

type PillProps = {
    label: string
    tone: "dark" | "light"
    onPress: () => void
    /** Sólido branco na ação primária; vidro quando o estado é informativo. */
    solid: boolean
    loading: boolean
    useGlass: boolean
}

const PILL_HEIGHT = sizes.buttons.height * 0.58

const pillBase: ViewStyle = {
    height: PILL_HEIGHT,
    minWidth: sizes.buttons.width * 0.38,
    paddingHorizontal: sizes.paddings["1md"],
    borderRadius: PILL_HEIGHT / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
}

function Pill({ label, tone, onPress, solid, loading, useGlass }: PillProps) {
    const labelStyle: TextStyle = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.title3 * 0.9,
        color: tone === "dark" ? colors.gray.black : colors.gray.white,
    }

    const content = loading ? (
        <ActivityIndicator color={tone === "dark" ? colors.gray.black : colors.gray.white} />
    ) : (
        <Text style={labelStyle}>{label}</Text>
    )

    if (solid || !useGlass) {
        return (
            <Pressable
                onPress={onPress}
                disabled={loading}
                style={[
                    pillBase,
                    {
                        backgroundColor: solid ? colors.gray.white : colors.gray.grey_08,
                        opacity: loading ? 0.6 : 1,
                    },
                ]}
            >
                {content}
            </Pressable>
        )
    }

    return (
        <GlassContainer spacing={8}>
            <GlassView
                colorScheme="dark"
                style={pillBase}
                colorScheme="dark"
                glassEffectStyle="regular"
                isInteractive={true}
                tintColor={colors.gray.grey_09 + "90"}
            >
                <Pressable
                    onPress={onPress}
                    disabled={loading}
                    style={[pillBase, { backgroundColor: "#00000000", opacity: loading ? 0.6 : 1 }]}
                >
                    {content}
                </Pressable>
            </GlassView>
        </GlassContainer>
    )
}

export default FriendButton
