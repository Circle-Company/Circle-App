import React from "react"

type AccountProviderProps = { children: React.ReactNode }
export type AccountContextsData = {
    refreshing: boolean
    setRefreshing: React.Dispatch<React.SetStateAction<boolean>>
}

const AccountContext = React.createContext<AccountContextsData>({} as AccountContextsData)

export function Provider({ children }: AccountProviderProps) {
    const [refreshing, setRefreshing] = React.useState(false)

    const contextValue: AccountContextsData = {
        refreshing,
        setRefreshing,
    }

    return <AccountContext.Provider value={contextValue}>{children}</AccountContext.Provider>
}
export default AccountContext
