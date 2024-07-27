import messaging from "@react-native-firebase/messaging"
import { devicePlatform } from "../platform/detection"

async function getPushToken(skipPermissionCheck = false) {
    const granted = skipPermissionCheck || (await messaging().getToken())
    if (granted) {
        return await messaging().getToken()
    }
}

async function registerPushToken(userId: number, token: string) {
    try {
        await agent.api.app.bsky.notification.registerPush({
            userId,
            token,
            platform: devicePlatform,
        })
    } catch (error) {
        console.error("Notifications: Failed to set push token", { message: error })
    }
}
