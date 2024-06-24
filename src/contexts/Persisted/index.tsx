import React from 'react'
import { SessionDataType } from './types'
import { useUserStore } from './persistedUser'
import { useAccountStore } from './persistedAccount'
import { usePreferencesStore } from './persistedPreferences'
import AuthContext from '../auth'
import { useStatisticsStore } from './persistedStatistics'
import { useHistoryStore } from './persistedHistory'

type PersistedProviderProps = { children: React.ReactNode }
export type PersistedContextData = { session: SessionDataType }

const PersistedContext = React.createContext<PersistedContextData>({} as PersistedContextData)

export function Provider({ children }: PersistedProviderProps) {
    const { sessionData, signOut, checkIsSigned} = React.useContext(AuthContext)

    const sessionUser = useUserStore()
    const sessionAccount = useAccountStore()
    const sessionPreferences = usePreferencesStore()
    const sessionStatistics = useStatisticsStore()
    const sessionHistory = useHistoryStore()

    React.useEffect(() => {
        if(sessionData.user) sessionUser.set(sessionData.user)
        if(sessionData.account) sessionAccount.set(sessionData.account)
        if(sessionData.preferences) sessionPreferences.set(sessionData.preferences)
        if(sessionData.statistics) sessionStatistics.set(sessionData.statistics)
        if(sessionData.history) sessionHistory.set(sessionData.history)
    }, [sessionData])

    React.useEffect(() => {
        const isSigned = checkIsSigned()
        if(!isSigned) {
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
            history: sessionHistory
        },
    }

    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}

export default PersistedContext