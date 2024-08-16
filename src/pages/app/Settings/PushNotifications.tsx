import messaging from "@react-native-firebase/messaging"
import React, { useEffect, useState } from "react"
import { Dimensions, StatusBar, useColorScheme } from "react-native"
import { View } from "../../../components/Themed"
import { SwitchButton } from "../../../components/general/switch-button"
import PersistedContext from "../../../contexts/Persisted"
import { ListPushNotificationsSettings } from "../../../features/list-push-notifications-settings"
import { DisabledNotificationsCard } from "../../../features/list-push-notifications-settings/disabled-notifications-card"
import { colors } from "../../../layout/constants/colors"

const WindowWidth = Dimensions.get("window").width

export default function SettingsPushNotifications() {
    const { session } = React.useContext(PersistedContext)
    const isDarkMode = useColorScheme() === "dark"
    const preferencesState = session.preferences.pushNotifications
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

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
        width: WindowWidth,
        alignItems: "center",
    }

    const handleEnable = () => {
        console.log("Switch enabled")
    }

    const handleDisable = () => {
        console.log("Switch disabled")
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
                title="Like"
                description="When your moment gets a like."
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableLikeMoment}
                        onPressEnable={handleEnable}
                        onPressDisable={handleDisable}
                    />
                }
            />
            <ListPushNotificationsSettings
                title="New Memory"
                description="When someone you follow posts a new Memory."
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableNewMemory}
                        onPressEnable={handleEnable}
                        onPressDisable={handleDisable}
                    />
                }
            />
            <ListPushNotificationsSettings
                title="Add to Memory"
                description="When someone you follow adds a moment to an existing memory."
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableAddToMemory}
                        onPressEnable={handleEnable}
                        onPressDisable={handleDisable}
                    />
                }
            />
            <ListPushNotificationsSettings
                title="Follow"
                description="When some user follows you."
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableFollowUser}
                        onPressEnable={handleEnable}
                        onPressDisable={handleDisable}
                    />
                }
            />
            <ListPushNotificationsSettings
                title="Profile View"
                description="When any user views your profile."
                leftComponent={
                    <SwitchButton
                        initialState={!preferencesState.disableViewUser}
                        onPressEnable={handleEnable}
                        onPressDisable={handleDisable}
                    />
                }
            />
            <View></View>
        </View>
    )
}
