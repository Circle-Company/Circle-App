import React, { useEffect } from "react"

import type { AccountState } from "./persistedAccount"
import type { HistoryState } from "./persistedHistory"
import type { PermissionsState } from "./persistedPermissions"
import type { PreferencesState } from "./persistedPreferences"
import { SessionDataType } from "./types"
import type { StatisticsState } from "./persistedStatistics"
import type { UserState } from "./persistedUser"
import { useAccountStore } from "./persistedAccount"
import { useHistoryStore } from "./persistedHistory"
import { usePermissionsStore } from "./persistedPermissions"
import { usePreferencesStore } from "./persistedPreferences"
import { useStatisticsStore } from "./persistedStatistics"
import { useUserStore } from "./persistedUser"

type PersistedProviderProps = {
    children: React.ReactNode
    sessionData: SessionDataType | null
    onSignOut?: () => void
    checkIsSigned?: () => boolean
}
type PersistedSessionStores = {
    user: UserState
    account: AccountState
    preferences: PreferencesState
    statistics: StatisticsState
    history: HistoryState
}

type PersistedDeviceStores = {
    permissions: PermissionsState
}

export type PersistedContextProps = {
    session: PersistedSessionStores
    device: PersistedDeviceStores
}

const PersistedContext = React.createContext<PersistedContextProps>({} as PersistedContextProps)

export function Provider({
    children,
    sessionData,
    onSignOut,
    checkIsSigned,
}: PersistedProviderProps) {
    console.log("🔄 PersistedProvider inicializando...")

    const sessionUser = useUserStore()
    const sessionAccount = useAccountStore()
    const sessionPreferences = usePreferencesStore()
    const sessionStatistics = useStatisticsStore()
    const sessionHistory = useHistoryStore()
    const devicePermissions = usePermissionsStore()

    // Sincronização simples quando há dados de sessão
    useEffect(() => {
        if (sessionData?.user?.id) {
            sessionUser.set(sessionData.user)

            if (sessionData.account) {
                const { coordinates, ...accountData } = sessionData.account
                sessionAccount.set(accountData)

                if (coordinates) {
                    sessionAccount.setCoordinates(coordinates)
                }
            }

            if (sessionData.preferences) {
                sessionPreferences.set(sessionData.preferences)
            }
        }
    }, [sessionData])

    // Limpeza simples quando não há autenticação
    useEffect(() => {
        if (checkIsSigned && !checkIsSigned()) {
            console.log("🧹 Limpando stores - usuário não autenticado")
            sessionUser.remove()
            sessionAccount.remove()
            sessionPreferences.remove()
            sessionStatistics.remove()
            sessionHistory.remove()
        }
    }, [sessionData])

    const contextValue: PersistedContextProps = {
        session: {
            user: sessionUser,
            account: sessionAccount,
            preferences: sessionPreferences,
            statistics: sessionStatistics,
            history: sessionHistory,
        },
        device: {
            permissions: devicePermissions,
            //metadata: deviceMetadata,
        },
    }

    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}

export default PersistedContext
