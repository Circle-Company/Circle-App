import React from 'react'
import { SessionDataType } from './types'
import { useUserStore } from './persistedUser'
import { useAccountStore } from './persistedAccount'
import { usePreferencesStore } from './persistedPreferences'

type PersistedProviderProps = { children: React.ReactNode }
export type PersistedContextData = { session: SessionDataType }

const PersistedContext = React.createContext<PersistedContextData>({} as PersistedContextData)

export function Provider({ children }: PersistedProviderProps) {
    const [ jwtToken, setJwtToken ] = React.useState<string | null>(null)

    const sessionUser = useUserStore()
    const sessionAccount = useAccountStore()
    const sessionPreferences = usePreferencesStore()

    const contextValue: any = {
        session: {
            user: sessionUser,
            account: sessionAccount,
            preferences: sessionPreferences,
            jwtToken,
            setJwtToken
        },
    }

    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}

export default PersistedContext