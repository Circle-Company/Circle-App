import React from 'react'
import { SessionDataType } from './types'
import { useUserStore } from './persistedUser'
import { useAccountStore } from './persistedAccount'
import { usePreferencesStore } from './persistedPreferences'
import AuthContext from '../auth'
import { useStatisticsStore } from './persistedStatistics'

type PersistedProviderProps = { children: React.ReactNode }
export type PersistedContextData = { session: SessionDataType }

const PersistedContext = React.createContext<PersistedContextData>({} as PersistedContextData)

export function Provider({ children }: PersistedProviderProps) {
    const { sessionData } = React.useContext(AuthContext)

    const sessionUser = useUserStore()
    const sessionAccount = useAccountStore()
    const sessionPreferences = usePreferencesStore()
    const sessionStatistics = useStatisticsStore()

    React.useEffect(() => {

    }, [sessionData])

    const contextValue: any = {
        session: {
            user: sessionUser,
            account: sessionAccount,
            preferences: sessionPreferences,
            statistics: sessionStatistics
        },
    }

    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}

export default PersistedContext