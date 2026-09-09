import React from "react"

type RedirectContextType = {
    redirectTo: "APP" | "AUTH" | "SPLASH"
    setRedirectTo: (value: "APP" | "AUTH" | "SPLASH") => void
}

export const RedirectContext = React.createContext<RedirectContextType>({} as RedirectContextType)

export function Provider({ children }: { children: React.ReactNode }) {
    const [redirectTo, setRedirectTo] = React.useState<"APP" | "AUTH" | "SPLASH">("SPLASH")

    // O objeto literal inline nascia novo a cada render, então **todo** consumidor deste
    // contexto re-renderizava junto — mesmo quando `redirectTo` não tinha mudado. Como este
    // provider está na raiz da árvore, era a árvore inteira.
    const value = React.useMemo(() => ({ redirectTo, setRedirectTo }), [redirectTo])

    return <RedirectContext.Provider value={value}>{children}</RedirectContext.Provider>
}
