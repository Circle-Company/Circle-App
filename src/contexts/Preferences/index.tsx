import React from "react"
import PersistedContext from "../Persisted"
import { Provider as LanguageProvider } from "./language"

export function Provider({ children }: React.PropsWithChildren<{}>) {
    const { session } = React.useContext(PersistedContext)
    const [preferencesLoaded, setPreferencesLoaded] = React.useState(false)

    React.useEffect(() => {
        async function getPreferences() {
            if (session?.user?.id && session?.preferences?.get && !preferencesLoaded) {
                try {
                    await session.preferences.get(session.user.id)
                    setPreferencesLoaded(true)
                } catch (error) {
                    console.error("Erro ao carregar preferências:", error)
                }
            }
        }
        getPreferences()
    }, [session?.user?.id, preferencesLoaded])

    return <LanguageProvider>{children}</LanguageProvider>
}
