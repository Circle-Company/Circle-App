import React from 'react'
import AuthContext from '../auth'
import { storage } from '../../store'
import { SessionDataType } from './types'
import { persistedUserClass } from './persistedUser'
import { persistedAccountClass } from './persistedAccount'
import { persistedPreferencesClass } from './persistedPreferences'

type PersistedProviderProps = { children: React.ReactNode}
export type PersistedContextData = {
    session: SessionDataType
}

const PersistedContext = React.createContext<PersistedContextData>({} as PersistedContextData)

export function Provider({ children }: PersistedProviderProps) {
    const { user } = React.useContext(AuthContext)
    const [ jwtToken, setJwtToken ] = React.useState<string | null>(null)

    let hasPreferencesOnStorage: boolean = false
    let hasUserOnStorage: boolean = false
    let hasAccountOnStorage: boolean = false
    let sessionUser : any = null
    let sessionAccount : any = null
    let sessionPreferences : any = null

    React.useEffect(() => {
        if(user) {
            sessionUser = new persistedUserClass({
                id: user.id,
                username: user.username,
                verifyed: user.verifyed,
                profile_picture: user.profile_picture
            })
            storage.getAllKeys().map((key) => {
                if(key.includes('account')) hasAccountOnStorage = true
                if(key.includes('user')) hasUserOnStorage = true
                if(key.includes('preferences')) hasPreferencesOnStorage = true
            })
            loadDataFromStoarage()
        }
    }, [])

    function loadDataFromStoarage() {
        sessionUser = hasUserOnStorage? new persistedUserClass({
            id: user.id,
            username: user.username,
            verifyed: user.verifyed,
            profile_picture: user.profile_picture
        }).loadUserFromStorage() : null
        sessionAccount = hasAccountOnStorage? new persistedAccountClass({
            blocked: false,
            muted: false,
            last_active_at: Date.now().toString(),
            last_login_at: Date.now().toString()
        }).loadAccountFromStorage() : null
        sessionPreferences = hasPreferencesOnStorage? new persistedPreferencesClass({
            language: { appLanguage: 'en', primaryLanguage: 'en' },
            content: {
                disableAutoplay: false,
                disableHaptics: false,
                disableTranslation: false,
                translationLanguage: 'en'
            }
        }).loadPreferencesFromStorage() : null
    }

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