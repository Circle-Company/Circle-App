import messaging from "@react-native-firebase/messaging"
import React from "react"
import { PermissionsAndroid } from "react-native"
import PersistedContext from "../../contexts/Persisted"

function postNotifications(): void {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
}

export function useRequestPermission() {
    const { device } = React.useContext(PersistedContext)
    
    const firebaseMessaging = React.useCallback(async (): Promise<boolean> => {
        const authStatus: number = await messaging().requestPermission()
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL
        device.permissions.setFirebaseMessaging(enabled)
        return enabled
    }, [device])

    return {
        firebaseMessaging,
        postNotifications,
    }
}
