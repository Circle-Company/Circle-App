import React from "react"

type RedirectContextType = {
    redirectTo: "APP" | "AUTH" | "SPLASH"
    appData: any
    setRedirectTo: (value: "APP" | "AUTH" | "SPLASH") => void
    setAppData: React.Dispatch<React.SetStateAction<object>>
}

export const RedirectContext = React.createContext<RedirectContextType>({} as RedirectContextType)

export function Provider({ children }: { children: React.ReactNode }) {
    const [redirectTo, setRedirectTo] = React.useState<"APP" | "AUTH" | "SPLASH">("SPLASH")
    const [appData, setAppData] = React.useState({})

    return (
        <RedirectContext.Provider value={{ redirectTo, appData, setRedirectTo, setAppData }}>
            {children}
        </RedirectContext.Provider>
    )
}
