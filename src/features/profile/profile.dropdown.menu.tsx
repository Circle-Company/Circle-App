import React from "react"
import { Alert } from "react-native"
import LanguageContext from "@/contexts/language"
import PersistedContext from "@/contexts/Persisted"
import ProfileContext, { profileProps } from "@/contexts/profile"
import { ContextMenu, Host, Button } from "@expo/ui/swift-ui"
import { useBlockMutation } from "@/queries/user.block"
import { Vibrate } from "@/lib/hooks/useHapticFeedback"

export function ProfileOptionsDropDownMenuIOS({
    children,
    profile,
}: {
    children?: React.ReactNode
    profile: profileProps["profile"]
}) {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const { setShowReportModal, getProfile, cleanProfile } = React.useContext(ProfileContext)
    const blockMutation = useBlockMutation({ userId: profile.id })

    async function handleBlock() {
        if (profile.interactions?.isBlocking === false) {
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
    }

    async function handleReport() {
        setShowReportModal(true)
    }

    return (
        <Host>
            <ContextMenu activationMethod="singlePress">
                <ContextMenu.Items>
                    {!profile.interactions?.isBlocking && (
                        <Button systemImage={"lock"} role="default" onPress={handleBlock}>
                            {t("Block @{{username}}", { username: profile.username })}
                        </Button>
                    )}
                    <Button
                        systemImage="exclamationmark.shield"
                        role="destructive"
                        onPress={handleReport}
                    >
                        {t("Report Account")}
                    </Button>
                </ContextMenu.Items>
                <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
            </ContextMenu>
        </Host>
    )
}
