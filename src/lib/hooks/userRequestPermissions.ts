import messaging from "@react-native-firebase/messaging"
import React from "react"
import { PermissionsAndroid } from "react-native"
import PersistedContext from "../../contexts/Persisted"

function postNotifications(): void {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
}
async function firebaseMessaging(): Promise<boolean> {
    const { device } = React.useContext(PersistedContext)
    let authStatus: number = await messaging().requestPermission()
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
    device.permissions.setFirebaseMessaging(enabled)
    return enabled
}

export const useRequestPermission = {
    firebaseMessaging,
    postNotifications,
}
