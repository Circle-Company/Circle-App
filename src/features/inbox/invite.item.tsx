import React from "react"
import { ActivityIndicator, Platform, Pressable, TextStyle, View, ViewStyle } from "react-native"
import {
    GlassContainer,
    GlassView,
    isGlassEffectAPIAvailable,
    isLiquidGlassAvailable,
} from "expo-glass-effect"
import { useRouter, usePathname } from "expo-router"

import { Text } from "@/components/Themed"
import { UserShow } from "@/components/user_show"
import ButtonStandart from "@/components/buttons/button-standart"
import { colors } from "@/constants/colors"
import fonts from "@/constants/fonts"
import sizes from "@/constants/sizes"
import LanguageContext from "@/contexts/language"
import ProfileContext from "@/contexts/profile"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"
import { useAcceptFriendRequestMutation } from "@/queries/friendship"
import { useUserSummaryQuery, type UserSummary } from "@/queries/user"
import type { FriendRequestInvite } from "@/api/friendship/friendship.types"

type InviteItemProps = {
    invite: FriendRequestInvite
    /**
     * Dados do usuário já conhecidos (vindos da notificação correspondente).
     * Evitam a linha nascer vazia enquanto `GET /users/:id` não responde.
     */
    placeholder?: UserSummary
}

/**
 * Uma linha da caixa de convites. Segue o mesmo formato do item de notificação
 * (foto + @username + texto), trocando o corpo pelo par texto/ação:
 * "@user Want to be your friend" + botão Accept.
 */
export function InviteItem({ invite, placeholder }: InviteItemProps) {
    const { t } = React.useContext(LanguageContext)
    const router = useRouter()
    const pathname = usePathname()
    const { setUserId, setProfilePreview } = React.useContext(ProfileContext)

    const { data: user } = useUserSummaryQuery(invite.userId, { placeholderData: placeholder })
    const acceptMutation = useAcceptFriendRequestMutation({ userId: invite.userId })

    const shouldUseGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const actor = {
        id: String(user?.id || invite.userId),
        username: String(user?.username || ""),
        verified: !!user?.verified,
        profilePicture: String(user?.profilePicture || ""),
    }

    const baseContainer: ViewStyle = {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        minHeight: sizes.screens.height * 0.08,
        paddingLeft: sizes.paddings["1sm"],
        paddingRight: sizes.paddings["1md"],
        paddingVertical: sizes.paddings["2sm"],
        borderRadius: sizes.borderRadius["1md"] * 1.5,
    }

    const container: ViewStyle = { ...baseContainer, backgroundColor: colors.gray.grey_09 }
    const glassContainer: ViewStyle = { ...baseContainer, backgroundColor: "#00000000" }

    const messageStyle: TextStyle = {
        color: colors.gray.white,
        fontFamily: fonts.family.Bold,
        fontSize: fonts.size.callout,
        letterSpacing: -0.25,
    }

    const acceptLabel: TextStyle = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body,
        color: colors.gray.black,
    }

    function handleOpenProfile() {
        const targetId = String(invite.userId)
        const targetPath = `/profile/${targetId}`
        if (pathname === targetPath) return
        setProfilePreview({ id: targetId, username: actor.username })
        setUserId(targetId)
        router.push({ pathname: "/profile/[userId]", params: { userId: targetId } })
    }

    async function handleAccept() {
        if (acceptMutation.isPending) return
        try {
            await acceptMutation.mutateAsync()
            Vibrate("notificationSuccess")
        } catch (e) {
            console.log("[invites] accept failed", e)
        }
    }

    const body = (
        <UserShow.Root data={actor}>
            <Pressable
                onPress={handleOpenProfile}
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
                <View style={{ marginRight: sizes.paddings["2sm"] }}>
                    <UserShow.ProfilePicture
                        pictureDimensions={{
                            width: sizes.sizes["3md"] * 1.1,
                            height: sizes.sizes["3md"] * 1.1,
                        }}
                        disableAction={true}
                        displayOnMoment={false}
                    />
                </View>
                <View style={{ flex: 1, gap: sizes.paddings["1sm"] * 0.5 }}>
                    <UserShow.Username
                        margin={0}
                        fontFamily={fonts.family["Semibold-Italic"]}
                        fontSize={fonts.size.callout}
                        textStyle={{ fontStyle: "italic", color: colors.gray.grey_03 + 99 }}
                        pressable={false}
                        displayYou={false}
                        displayOnMoment={false}
                    />
                    <Text style={messageStyle} numberOfLines={2}>
                        {t("Want to be your friend")}
                    </Text>
                </View>
            </Pressable>

            <View style={{ marginLeft: sizes.margins["2sm"], alignSelf: "center" }}>
                <ButtonStandart
                    action={handleAccept}
                    margins={false}
                    height={sizes.buttons.height * 0.42}
                    backgroundColor={colors.gray.white}
                    style={{ opacity: acceptMutation.isPending ? 0.6 : 1 }}
                >
                    {acceptMutation.isPending ? (
                        <ActivityIndicator color={colors.gray.black} />
                    ) : (
                        <Text style={acceptLabel}>{t("Accept")}</Text>
                    )}
                </ButtonStandart>
            </View>
        </UserShow.Root>
    )

    if (shouldUseGlass) {
        return (
            <GlassContainer spacing={10}>
                <GlassView
                    colorScheme="dark"
                    style={glassContainer}
                    colorScheme="dark"
                    glassEffectStyle="regular"
                    isInteractive={true}
                    tintColor={colors.gray.grey_09 + "90"}
                >
                    {body}
                </GlassView>
            </GlassContainer>
        )
    }

    return <View style={container}>{body}</View>
}

export default InviteItem
