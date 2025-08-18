import { DeviceDataType, SessionDataType } from "./types"

import React from "react"
import { refreshJwtToken } from "../../lib/hooks/useRefreshJwtToken"
import AuthContext from "../Auth/index"
import { useAccountStore } from "./persistedAccount"
import { useHistoryStore } from "./persistedHistory"
import { usePermissionsStore } from "./persistedPermissions"
import { usePreferencesStore } from "./persistedPreferences"
import { useStatisticsStore } from "./persistedStatistics"
import { useUserStore } from "./persistedUser"

type PersistedProviderProps = { children: React.ReactNode }
export type PersistedContextProps = {
    session: SessionDataType
    device: DeviceDataType
}

const PersistedContext = React.createContext<PersistedContextProps>({} as PersistedContextProps)

export function Provider({ children }: PersistedProviderProps) {
    const { sessionData, signOut, checkIsSigned, signIn, signUp } = React.useContext(AuthContext)

    const sessionUser = useUserStore()
    const sessionAccount = useAccountStore()
    const sessionPreferences = usePreferencesStore()
    const sessionStatistics = useStatisticsStore()
    const sessionHistory = useHistoryStore()
    const devicePermissions = usePermissionsStore()

    React.useEffect(() => {
        if (sessionData.user) sessionUser.set(sessionData.user)
        if (sessionData.account) sessionAccount.set(sessionData.account)
        if (sessionData.preferences) sessionPreferences.set(sessionData.preferences)
        if (sessionData.statistics) sessionStatistics.set(sessionData.statistics)
        if (sessionData.history) sessionHistory.set(sessionData.history)
    }, [
        sessionData,
        signIn,
        signUp,
        signOut,
        sessionUser,
        sessionAccount,
        sessionPreferences,
        sessionStatistics,
        sessionHistory,
    ])

    async function refreshToken() {
        await refreshJwtToken(
            { username: sessionUser.username, id: sessionUser.id },
            sessionAccount,
        ).catch((error: any) => {
            throw new Error(error)
        })
    }

    React.useEffect(() => {
        devicePermissions.set({
            postNotifications: false,
            firebaseMessaging: false,
        })
        refreshToken()
    }, [])

    React.useEffect(() => {
        const isSigned = checkIsSigned()
        if (!isSigned) {
            sessionUser.remove()
            sessionAccount.remove()
            sessionPreferences.remove()
            sessionStatistics.remove()
            sessionHistory.remove()
        }
    }, [signOut])

    const contextValue: any = {
        session: {
            user: sessionUser,
            account: sessionAccount,
            preferences: sessionPreferences,
            statistics: sessionStatistics,
            history: sessionHistory,
        },
        device: {
            permissions: devicePermissions,
        },
    }

    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}

export default PersistedContext
