import React from 'react'
import { userReciveDataProps } from '../../components/user_show/user_show-types'
import { PersistedContextData, PreferencesDataType } from './types'

type PersistedProviderProps = {
    children: React.ReactNode
}

const PersistedContext = React.createContext<PersistedContextData>({} as PersistedContextData)

export function Provider({ children }: PersistedProviderProps) {

    const [ account, setAccount ] = React.useState<userReciveDataProps>({} as userReciveDataProps)
    const [ preferences, setPreferences ] = React.useState<PreferencesDataType>({} as PreferencesDataType)

    const sessionData = {account, preferences}


    function storeSessionData() {

    }

    function getSessionData() {

    }
    
    const contextValue = {
        session: sessionData,
        storeSessionData,
        getSessionData
    }
    return <PersistedContext.Provider value={contextValue}>{children}</PersistedContext.Provider>
}