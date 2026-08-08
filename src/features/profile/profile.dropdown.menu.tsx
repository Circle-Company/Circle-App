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
import { Vibrate } from "@/lib/hooks/useHapticFeedback"

export function ProfileOptionsDropDownMenuIOS({ profile }: { profile: profileProps["profile"] }) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const { setShowReportModal, getProfile, cleanProfile } = React.useContext(ProfileContext)
    const blockMutation = useBlockMutation({ userId: profile.id })

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

    function handleReport() {
        setShowReportModal(true)
    }

    return (
        <Host matchContents colorScheme="dark">
            <Menu label="" systemImage="ellipsis">
                <Section>
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
