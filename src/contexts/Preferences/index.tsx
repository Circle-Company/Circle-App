import React from "react"
import { Provider as LanguageProvider } from "./language"

export function Provider({children}: React.PropsWithChildren<{}>){
    return (
        <LanguageProvider>
            {children}
        </LanguageProvider>
    )
}