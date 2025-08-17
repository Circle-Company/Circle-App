import { View } from "@/components/Themed"
import { SwitchButton } from "@/components/general/switch-button"
import PersistedContext from "@/contexts/Persisted"
import LanguageContext from "@/contexts/Preferences/language"
import { ListPushNotificationsSettings } from "@/features/list-push-notifications-settings"
import { DisabledNotificationsCard } from "@/features/list-push-notifications-settings/disabled-notifications-card"
import { colors } from "@/layout/constants/colors"
import messaging from "@react-native-firebase/messaging"
import React, { useEffect, useState } from "react"
import { StatusBar, useColorScheme } from "react-native"
import {
    useDisableHapticsMutation,
    useEnableEnableMutation,
} from "../../../state/queries/preferences-haptic-feedback"

export default function SettingsHapticFeedback() {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const preferencesState = session.preferences.content
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

    const disableHapticsMutation = useDisableHapticsMutation()
    const enableHapticsMutation = useEnableEnableMutation()

    useEffect(() => {
        // Verificar se as notificações estão habilitadas
        const checkNotificationPermission = async () => {
            const hasPermission = await messaging().hasPermission()
            setNotificationsEnabled(hasPermission === messaging.AuthorizationStatus.AUTHORIZED)
        }

        checkNotificationPermission()
    }, [])

    const container = {
        flex: 1,
        alignItems: "center",
    }

    if (!notificationsEnabled)
        return (
            <View style={[container, { justifyContent: "center", top: -60 }]}>
                <DisabledNotificationsCard />
            </View>
        )

    return (
        <View style={container}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={
                    isDarkMode ? colors.gray.black.toString() : colors.gray.white.toString()
                }
            />
            <ListPushNotificationsSettings
                title={t("Vibration")}
                description={t(
                    "The device gives haptic vibration feedback to confirm that an action has been maded."
                )}
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableHaptics}
                        onPressEnable={enableHapticsMutation.mutate}
                        onPressDisable={disableHapticsMutation.mutate}
                    />
                }
            />
            <View></View>
        </View>
    )
}
