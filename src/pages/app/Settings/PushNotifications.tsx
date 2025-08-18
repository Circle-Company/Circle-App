import messaging from "@react-native-firebase/messaging"
import React, { useEffect, useState } from "react"
import { StatusBar, useColorScheme } from "react-native"
import { SwitchButton } from "../../../components/general/switch-button"
import { View, ViewStyle } from "../../../components/Themed"
import { colors } from "../../../constants/colors"
import sizes from "../../../constants/sizes"
import PersistedContext from "../../../contexts/Persisted"
import LanguageContext from "../../../contexts/Preferences/language"
import { ListPushNotificationsSettings } from "../../../features/list-push-notifications-settings"
import { DisabledNotificationsCard } from "../../../features/list-push-notifications-settings/disabled-notifications-card"
import {
    useDisableAddToMemoryMutation,
    useDisableFollowUserMutation,
    useDisableLikeMomentMutation,
    useDisableNewMemoryMutation,
    useDisableViewUserMutation,
    useEnableAddToMemoryMutation,
    useEnableFollowUserMutation,
    useEnableLikeMomentMutation,
    useEnableNewMemoryMutation,
    useEnableViewUserMutation,
} from "../../../state/queries/preferences-push-notifications"

export default function SettingsPushNotifications() {
    const { session } = React.useContext(PersistedContext)
    const { t } = React.useContext(LanguageContext)
    const isDarkMode = useColorScheme() === "dark"
    const preferencesState = session.preferences.pushNotifications
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

    const disableLikeMomentMutation = useDisableLikeMomentMutation()
    const enableLikeMomentMutation = useEnableLikeMomentMutation()
    const disableNewMemoryMutation = useDisableNewMemoryMutation()
    const enableNewMemoryMutation = useEnableNewMemoryMutation()
    const disableAddToMemoryMutation = useDisableAddToMemoryMutation()
    const enableAddToMemoryMutation = useEnableAddToMemoryMutation()
    const disableFollowUserMutation = useDisableFollowUserMutation()
    const enableFollowUserMutation = useEnableFollowUserMutation()
    const disableViewUserMutation = useDisableViewUserMutation()
    const enableViewUserMutation = useEnableViewUserMutation()

    useEffect(() => {
        // Verificar se as notificações estão habilitadas
        const checkNotificationPermission = async () => {
            const hasPermission = await messaging().hasPermission()
            setNotificationsEnabled(hasPermission === messaging.AuthorizationStatus.AUTHORIZED)
        }

        checkNotificationPermission()
    }, [])

    const container: ViewStyle = {
        flex: 1,
        alignItems: "center" as const,
        gap: sizes.paddings["1sm"],
    }

    const container_disabled: ViewStyle = {
        flex: 1,
        alignItems: "center" as const,
        justifyContent: "center",
        top: -60,
    }

    if (!notificationsEnabled)
        return (
            <View style={container_disabled}>
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
                title={t("Like on Moment")}
                description={t("When your moment gets a like.")}
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableLikeMoment}
                        onPressEnable={enableLikeMomentMutation.mutate}
                        onPressDisable={disableLikeMomentMutation.mutate}
                    />
                }
            />
            <ListPushNotificationsSettings
                title={t("Memory Creation")}
                description={t("When someone you follow posts a new Memory.")}
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableNewMemory}
                        onPressEnable={enableNewMemoryMutation.mutate}
                        onPressDisable={disableNewMemoryMutation.mutate}
                    />
                }
            />
            <ListPushNotificationsSettings
                title={t("Added to Memory")}
                description={t("When someone you follow adds a moment to an existing memory.")}
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableAddToMemory}
                        onPressEnable={enableAddToMemoryMutation.mutate}
                        onPressDisable={disableAddToMemoryMutation.mutate}
                    />
                }
            />
            <ListPushNotificationsSettings
                title={t("New Follower")}
                description={t("When some user follows you.")}
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableFollowUser}
                        onPressEnable={enableFollowUserMutation.mutate}
                        onPressDisable={disableFollowUserMutation.mutate}
                    />
                }
            />
            <ListPushNotificationsSettings
                title={t("Profile Visit")}
                description={t("When any user views your profile.")}
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableViewUser}
                        onPressEnable={enableViewUserMutation.mutate}
                        onPressDisable={disableViewUserMutation.mutate}
                    />
                }
            />
            <View></View>
        </View>
    )
}
