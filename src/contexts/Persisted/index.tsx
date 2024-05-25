import React from 'react'
import { SessionDataType } from './types'
import { useUserStore } from './persistedUser'
import { useAccountStore } from './persistedAccount'
import { usePreferencesStore } from './persistedPreferences'
import AuthContext from '../auth'

type PersistedProviderProps = { children: React.ReactNode }
export type PersistedContextData = { session: SessionDataType }

const PersistedContext = React.createContext<PersistedContextData>({} as PersistedContextData)

export function Provider({ children }: PersistedProviderProps) {
    const { user } = React.useContext(AuthContext)

    const [ jwtToken, setJwtToken ] = React.useState<string | null>(null)

    const sessionUser = useUserStore()
    const sessionAccount = useAccountStore()
    const sessionPreferences = usePreferencesStore()

    React.useEffect(() => {
        if(user) sessionUser.setUser({
            id: user.id,
            username: user.username,
            description: user.description? user.description : '',
            verifyed: user.verifyed,
            profile_picture: { small_resolution: '', tiny_resolution: user.profile_picture.tiny_resolution}
        })
    }, [user])

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