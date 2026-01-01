import React from "react"
import { Host, List, Section, Switch, Button } from "@expo/ui/swift-ui"
import { useRouter } from "expo-router"
import PersistedContext from "@/contexts/Persisted"

export function IosSettings() {
    const router = useRouter()
    const { session } = React.useContext(PersistedContext)
    const prefs = session.preferences

    return (
        <Host style={{ flex: 1 }}>
            <List
                scrollEnabled={true}
                editModeEnabled={false}
                deleteEnabled={false}
                moveEnabled={false}
                listStyle="insetGrouped"
                selectEnabled={false}
            >
                <Section title="Public Profile">
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/profile-picture")}
                    >
                        Profile Picture
                    </Button>
                    <Button variant="default" onPress={() => router.push("/(tabs)/settings/name")}>
                        Name
                    </Button>
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/description")}
                    >
                        Description
                    </Button>
                </Section>

                <Section title="Account">
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/preferences")}
                    >
                        Preferences
                    </Button>
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/password")}
                    >
                        Password
                    </Button>
                </Section>

                <Section title="Preferences">
                    <Switch
                        variant="switch"
                        label="Autoplay"
                        checked={!prefs.content.disableAutoplay}
                        onValueChange={(v) => prefs.setDisableAutoPlay(!v)}
                    />
                    <Switch
                        variant="switch"
                        label="Haptic Feedback"
                        checked={!prefs.content.disableHaptics}
                        onValueChange={(v) => prefs.setDisableHaptics(!v)}
                    />
                    <Switch
                        variant="switch"
                        label="Translation"
                        checked={!prefs.content.disableTranslation}
                        onValueChange={(v) => prefs.setDisableTranslation(!v)}
                    />
                    <Switch
                        variant="switch"
                        label="Mute Audio"
                        checked={prefs.content.muteAudio}
                        onValueChange={prefs.setMuteAudio}
                    />
                </Section>

                <Section title="Notifications">
                    <Switch
                        variant="switch"
                        label="Likes"
                        checked={!prefs.pushNotifications.disableLikeMoment}
                        onValueChange={(v) => prefs.setDisableLikeMoment(!v)}
                    />
                    <Switch
                        variant="switch"
                        label="New Memories"
                        checked={!prefs.pushNotifications.disableNewMemory}
                        onValueChange={(v) => prefs.setDisableNewMemory(!v)}
                    />
                    <Switch
                        variant="switch"
                        label="Add To Memory"
                        checked={!prefs.pushNotifications.disableAddToMemory}
                        onValueChange={(v) => prefs.setDisableAddToMemory(!v)}
                    />
                    <Switch
                        variant="switch"
                        label="Follow User"
                        checked={!prefs.pushNotifications.disableFollowUser}
                        onValueChange={(v) => prefs.setDisableFollowUser(!v)}
                    />
                    <Switch
                        variant="switch"
                        label="View User"
                        checked={!prefs.pushNotifications.disableViewUser}
                        onValueChange={(v) => prefs.setDisableViewUser(!v)}
                    />
                </Section>

                <Section title="Legal">
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/privacy-policy")}
                    >
                        Privacy Policy
                    </Button>
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/terms-of-service")}
                    >
                        Terms of Service
                    </Button>
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/community-guidelines")}
                    >
                        Community Guidelines
                    </Button>
                </Section>

                <Section title="More">
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/version")}
                    >
                        Version
                    </Button>
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/support")}
                    >
                        Support
                    </Button>
                    <Button
                        variant="default"
                        onPress={() => router.push("/(tabs)/settings/log-out")}
                    >
                        Log Out
                    </Button>
                </Section>
            </List>
        </Host>
    )
}
