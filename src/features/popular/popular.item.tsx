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
import { useSendFriendRequestMutation } from "@/queries/friendship"
import type { PopularPerson } from "@/api/radar/radar.types"

type PopularItemProps = {
    person: PopularPerson
    /** Chamado assim que o convite é disparado — a lista tira o card na hora. */
    onInvited: (userId: string) => void
    /** Chamado quando o convite falha — a lista devolve o card e recarrega. */
    onInviteFailed: (userId: string) => void
}

/**
 * Uma linha de "populares na sua região": foto + @username + faixa de amigos +
 * botão de convite. Mesmo formato do item da caixa de convites, trocando o
 * "Accept" pelo "Invite".
 *
 * O texto de popularidade é montado a partir de `friendsCountBucket`, não do
 * `friendsLabel` — este último vem sempre em inglês. Quando o bucket é `null` a
 * pessoa não tem faixa e a linha some (ver docs/popular-nearby.md §3).
 */
export function PopularItem({ person, onInvited, onInviteFailed }: PopularItemProps) {
    const { t } = React.useContext(LanguageContext)
    const router = useRouter()
    const pathname = usePathname()
    const { setUserId, setProfilePreview } = React.useContext(ProfileContext)

    const inviteMutation = useSendFriendRequestMutation({ userId: person.userId })

    const shouldUseGlass =
        Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable()

    const actor = {
        id: String(person.userId),
        username: String(person.username || ""),
        verified: false,
        profilePicture: String(person.profilePictureUrl || ""),
    }

    const friendsText = person.friendsCountBucket
        ? t("more than {{friends}} friends", { friends: person.friendsCountBucket })
        : null

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

    const inviteLabel: TextStyle = {
        fontFamily: fonts.family["Black-Italic"],
        fontSize: fonts.size.body,
        color: colors.gray.black,
    }

    function handleOpenProfile() {
        const targetId = String(person.userId)
        const targetPath = `/profile/${targetId}`
        if (pathname === targetPath) return
        setProfilePreview({ id: targetId, username: actor.username })
        setUserId(targetId)
        router.push({ pathname: "/profile/[userId]", params: { userId: targetId } })
    }

    async function handleInvite() {
        if (inviteMutation.isPending) return
        // Remoção otimista: o backend já não devolve quem foi convidado, então
        // esperar o round-trip só faria o card piscar antes de sumir.
        onInvited(person.userId)
        try {
            await inviteMutation.mutateAsync()
            Vibrate("notificationSuccess")
        } catch (e) {
            console.log("[popular] invite failed", e)
            onInviteFailed(person.userId)
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
                    {!!friendsText && (
                        <Text style={messageStyle} numberOfLines={2}>
                            {friendsText}
                        </Text>
                    )}
                </View>
            </Pressable>

            <View style={{ marginLeft: sizes.margins["2sm"], alignSelf: "center" }}>
                <ButtonStandart
                    action={handleInvite}
                    margins={false}
                    height={sizes.buttons.height * 0.42}
                    backgroundColor={colors.gray.white}
                    style={{ opacity: inviteMutation.isPending ? 0.6 : 1 }}
                >
                    {inviteMutation.isPending ? (
                        <ActivityIndicator color={colors.gray.black} />
                    ) : (
                        <Text style={inviteLabel}>{t("Invite")}</Text>
                    )}
                </ButtonStandart>
            </View>
        </UserShow.Root>
    )

    if (shouldUseGlass) {
        return (
            <GlassContainer spacing={10}>
                <GlassView
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

export default PopularItem
