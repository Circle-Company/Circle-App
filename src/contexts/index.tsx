import React from "react"
import AuthContext, { AuthContextsData } from "./Auth"
import NotificationContext, { NotificationContextData } from "./notification"
import ViewProfileContext, { ViewProfileContextsData } from "./viewProfile"

interface AppContextProps {
    authContext: AuthContextsData
    notificationContext: NotificationContextData
    viewProfileContext: ViewProfileContextsData
}

const AppContext = React.createContext<AppContextProps | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const authContext = React.useContext(AuthContext)
    const notificationContext = React.useContext(NotificationContext)
    const viewProfileContext = React.useContext(ViewProfileContext)

    return (
        <AppContext.Provider value={{ authContext, notificationContext, viewProfileContext }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => {
    const context = React.useContext(AppContext)
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider")
    }
    return context
}
