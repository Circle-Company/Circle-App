import React from "react"
import PersistedContext from "../Persisted"
import { Provider as LanguageProvider } from "./language"

export function Provider({ children }: React.PropsWithChildren<{}>) {
    const { session } = React.useContext(PersistedContext)

    React.useEffect(() => {
        async function getPreferences() {
            await session.preferences.get(session.user.id)
        }
        getPreferences()
    }, [])
    return <LanguageProvider>{children}</LanguageProvider>
}
