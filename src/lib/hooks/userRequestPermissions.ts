import messaging from "@react-native-firebase/messaging"
import React from "react"
import { PermissionsAndroid } from "react-native"
import PersistedContext from "../../contexts/Persisted"

function postNotifications(): void {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
}
async function firebaseMessaging(): Promise<string | void> {
    const { device } = React.useContext(PersistedContext)
    const authStatus = await messaging().requestPermission()
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
    if (enabled) {
        device.permissions.setPostNotifications(enabled)
        return messaging().getToken()
    } else return
}

export const requestPermission = {
    firebaseMessaging,
    postNotifications,
}
