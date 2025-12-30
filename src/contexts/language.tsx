import { LanguageType, LanguagesCodesType, LanguagesListType } from "@/locales/LanguageTypes"
import i18n, { languageResources } from "@/locales/i18n"

import React from "react"
import { useTranslation } from "react-i18next"
import { languagesList } from "@/locales/languagesList"
import { useSetAppLanguageMutation } from "@/queries/preferences.language"
import PersistedContext from "./Persisted"

type LanguageProviderProps = { children: React.ReactNode }
type languageContextData = {
    t: any
    languagesList: LanguagesListType
    languageResources: typeof languageResources
    atualAppLanguage: LanguageType
    changeAppLanguage: (languageCode: LanguagesCodesType) => Promise<void>
}
const LanguageContext = React.createContext<languageContextData>({} as languageContextData)

export function Provider({ children }: LanguageProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [atualAppLanguage, setAtualAppLanguage] = React.useState<LanguageType>(languagesList[0])

    // initialize mutation without fixed params so we can call it with the selected language later
    const setAppLanguageMutation: any = useSetAppLanguageMutation({
        appLanguage: atualAppLanguage.code,
    })

    /**
     * Change app language:
     * - Always update i18n and local state so it works even when session is null (e.g. login screen)
     * - Try to persist into session.preferences if available
     * - Try to call backend mutation if the hook exposes mutate
     */
    async function changeAppLanguage(languageCode: LanguagesCodesType) {
        // 1) change i18n language (affects translations immediately)
        await i18n.changeLanguage(languageCode)

        // 2) set local state to reflect selection (fallback to first language in list)
        const selectedLanguage =
            languagesList.find((l) => l.code === languageCode) ?? languagesList[0]
        setAtualAppLanguage(selectedLanguage)

        // 3) persist into session preferences if available (safe-guard)
        try {
            if (session?.preferences?.setAppLanguage) {
                // if your session API expects the code only, pass the code; adjust if needed
                session.preferences.setAppLanguage(languageCode)
            } else if (session?.preferences) {
                // if there's a preferences object but no helper, try to set the field directly
                // NOTE: only do this if your session object supports mutation like this
                // (this block is optional — keep or remove depending on session implementation)
                ;(session.preferences as any).language = {
                    ...(session.preferences as any).language,
                    appLanguage: languageCode,
                }
            }
        } catch (err) {
            // swallow persistence errors so UI language still changes
            // optionally log the error to your telemetry
            // console.warn("Failed to persist language to session:", err)
        }

        // 4) call server mutation if available (call with a payload object; adjust if your mutate signature differs)
        try {
            if (typeof setAppLanguageMutation?.mutate === "function") {
                // try common shapes: mutate(payload) where payload = { appLanguage: languageCode }
                setAppLanguageMutation.mutate({ appLanguage: languageCode })
            }
        } catch (err) {
            // swallow mutation errors so UI doesn't break
            // console.warn("Language mutation failed:", err)
        }
    }

    /**
     * Read current language from session OR i18n and update local state.
     * This is used when session becomes available or on mount.
     */
    function changeAtualAppLanguage() {
        const currentLanguageCode =
            session?.preferences?.language?.appLanguage ??
            (i18n && (i18n.language as string)) ??
            languagesList[0].code

        const selectedLanguage =
            languagesList.find((language) => language.code === currentLanguageCode) ??
            languagesList[0]

        setAtualAppLanguage(selectedLanguage)

        // if we have session language explicitly, sync to server (optional)
        if (session?.preferences?.language?.appLanguage) {
            try {
                if (typeof setAppLanguageMutation?.mutate === "function") {
                    setAppLanguageMutation.mutate({ appLanguage: currentLanguageCode })
                }
            } catch {
                // ignore
            }
        }
    }

    // when session preferences change, reflect it locally
    React.useEffect(() => {
        if (session?.preferences?.language?.appLanguage) {
            changeAtualAppLanguage()
        }
    }, [session?.preferences?.language])

    // on mount: initialize i18n from session or existing i18n language
    React.useEffect(() => {
        const defaultLanguage =
            session?.preferences?.language?.appLanguage ||
            (i18n && (i18n.language as string)) ||
            "en"
        // ensure i18n and local state reflect the default
        i18n.changeLanguage(defaultLanguage).catch(() => {})
        changeAtualAppLanguage()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { t } = useTranslation()

    const contextValue = {
        languagesList,
        t: t,
        atualAppLanguage,
        languageResources,
        changeAppLanguage,
    }
    return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export default LanguageContext
