import React from "react"

type BottomTabs = 'Home' | 'Account'
type BottomTabsProviderProps = { children: React.ReactNode }

export type BottomTabsContextsData = {
    currentTab: BottomTabs
    setCurrentTab: React.Dispatch<React.SetStateAction<BottomTabs>>
}
const BottomTabsContext = React.createContext<BottomTabsContextsData>({} as BottomTabsContextsData)

export function Provider({children}: BottomTabsProviderProps) {
    const [ currentTab, setCurrentTab ] = React.useState<BottomTabs>('Home')

    const contextValue: BottomTabsContextsData = {
        currentTab,
        setCurrentTab
    }

    return (
        <BottomTabsContext.Provider value={contextValue}>
            {children}
        </BottomTabsContext.Provider>
    )
}
export default BottomTabsContext