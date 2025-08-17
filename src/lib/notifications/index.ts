import { apiRoutes } from "../../services/Api"

async function registerPushToken({ userId, token }: { userId: string; token: string }) {
    try {
        if (!userId || (typeof token !== "string" && token !== ""))
            throw Error("session.user.id or session.account.firebasePushToken have a null value")
        await apiRoutes.notification.setToken({
            userId,
            token,
        })
    } catch (error) {
        console.error("Notifications: Failed to set push token", { message: error })
    }
}

export const notification = {
    registerPushToken,
}
