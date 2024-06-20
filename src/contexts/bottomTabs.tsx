import React from "react"

export type BottomTabsProps = 'Home' | 'Account'
type BottomTabsProviderProps = { children: React.ReactNode }

export type BottomTabsContextsData = {
    currentTab: BottomTabsProps
    setCurrentTab: React.Dispatch<React.SetStateAction<BottomTabsProps>>
}
const BottomTabsContext = React.createContext<BottomTabsContextsData>({} as BottomTabsContextsData)

export function Provider({children}: BottomTabsProviderProps) {
    const [ currentTab, setCurrentTab ] = React.useState<BottomTabsProps>('Home')

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