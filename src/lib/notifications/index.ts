import React from "react"
import PersistedContext from "../../contexts/Persisted"
import { apiRoutes } from "../../services/Api"

async function refreshPushToken(token: string) {
    const { session } = React.useContext(PersistedContext)
    if (token) session.account.setFirebasePushToken(token)
}

async function registerPushToken({ userId, token }: { userId: number; token: string }) {
    try {
        if (!userId || !token)
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
    refreshPushToken,
    registerPushToken,
}
