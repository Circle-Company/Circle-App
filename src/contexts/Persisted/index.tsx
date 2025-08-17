import { DeviceDataType, SessionDataType } from "./types"

import AuthContext from "@/contexts/Auth"
import React from "react"
import { refreshJwtToken } from "@/lib/hooks/useRefreshJwtToken"
import { useAccountStore } from "@/contexts/Persisted/persistedAccount"
import { useHistoryStore } from "@/contexts/Persisted/persistedHistory"
import { usePermissionsStore } from "@/contexts/Persisted/persistedPermissions"
import { usePreferencesStore } from "@/contexts/Persisted/persistedPreferences"
import { useStatisticsStore } from "@/contexts/Persisted/persistedStatistics"
import { useUserStore } from "@/contexts/Persisted/persistedUser"

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
    }, [sessionData, signIn, signUp, signOut])

    async function refreshToken() {
        await refreshJwtToken(
            { username: sessionUser.username, id: sessionUser.id },
            sessionAccount
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
