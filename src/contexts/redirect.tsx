import React from "react"

type RedirectContextType = {
    redirectTo: "APP" | "AUTH" | "SPLASH"
    setRedirectTo: (value: "APP" | "AUTH" | "SPLASH") => void
}

export const RedirectContext = React.createContext<RedirectContextType>({} as RedirectContextType)

export function Provider({ children }: { children: React.ReactNode }) {
    const [redirectTo, setRedirectTo] = React.useState<"APP" | "AUTH" | "SPLASH">("SPLASH")

    return (
        <RedirectContext.Provider value={{ redirectTo, setRedirectTo }}>
            {children}
        </RedirectContext.Provider>
    )
}
