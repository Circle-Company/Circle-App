import React from "react"
import { Alert } from "react-native"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"
import ProfileContext, { profileProps } from "@/contexts/profile"
import { Button, Host, Menu, Section } from "@expo/ui/swift-ui"
import {
    clipShape,
    frame,
    glassEffect,
    imageScale,
    padding,
    tint,
} from "@expo/ui/swift-ui/modifiers"
import { colors } from "@/constants/colors"
import { useBlockMutation } from "@/queries/user.block"
import { useFriendshipStatusQuery, useRemoveFriendMutation } from "@/queries/friendship"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"

export function ProfileOptionsDropDownMenuIOS({ profile }: { profile: profileProps["profile"] }) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const { setShowReportModal, getProfile, cleanProfile } = React.useContext(ProfileContext)
    const blockMutation = useBlockMutation({ userId: profile.id })
    const removeFriendMutation = useRemoveFriendMutation({ userId: profile.id })
    const { data: friendshipStatus } = useFriendshipStatusQuery(profile.id, {
        enabled: !!profile.id,
    })

    // Prefere o status vindo da query (mais fresco que o payload do perfil,
    // que só é relido no refresh da tela).
    const areFriends = friendshipStatus?.areFriends ?? profile.interactions?.areFriends ?? false

    async function handleBlock() {
        if (profile.interactions?.isBlocking !== false) return
        Alert.alert(
            t("Block @{{username}}", { username: profile.username }),
            t(
                "When blocked, this user will not be able to see your posts or interact with your account.",
            ),
            [
                { text: t("Cancel"), style: "cancel" },
                {
                    text: t("Block"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await blockMutation.mutateAsync().finally(() => {
                                Vibrate("rigid")
                            })
                            cleanProfile()
                        } catch (e) {
                            console.log(e)
                        }
                    },
                },
            ],
        )
    }

    function handleUnfriend() {
        Alert.alert(
            t("Unfriend @{{username}}", { username: profile.username }),
            t("You will no longer be friends. Neither of you will be notified."),
            [
                { text: t("Cancel"), style: "cancel" },
                {
                    text: t("Unfriend"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeFriendMutation.mutateAsync()
                            Vibrate("rigid")
                            await getProfile(profile.id)
                        } catch (e) {
                            console.log(e)
                        }
                    },
                },
            ],
        )
    }

    function handleReport() {
        setShowReportModal(true)
    }

    return (
        <Host matchContents colorScheme="dark">
            <Menu label="" systemImage="ellipsis">
                <Section>
                    {areFriends && (
                        <Button
                            systemImage="person.badge.minus"
                            label={t("Unfriend @{{username}}", { username: profile.username })}
                            onPress={handleUnfriend}
                        />
                    )}
                    {!profile.interactions?.isBlocking && (
                        <Button
                            systemImage="hand.raised"
                            label={t("Block @{{username}}", { username: profile.username })}
                            onPress={handleBlock}
                        />
                    )}
                    <Button
                        systemImage="flag"
                        role="destructive"
                        label={t("Report Account")}
                        onPress={handleReport}
                    />
                </Section>
            </Menu>
        </Host>
    )
}
