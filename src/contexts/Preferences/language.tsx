import React from "react"
import { LanguagesCodesType } from "../../locales/LanguageTypes"
import i18n from '../../locales/i18n'
import PersistedContext from "../Persisted"

type LanguageProviderProps = { children: React.ReactNode }
type languageContextData = {
    changePrimaryLanguage: (LanguageCode: LanguagesCodesType) => void
    changeAppLanguage: (languageCode: LanguagesCodesType) => void
    changeContentLanguage: (LanguageCode: LanguagesCodesType) => void
}
const LanguageContext = React.createContext<languageContextData>({} as languageContextData)

export function Provider({ children }: LanguageProviderProps) {
    const { session } = React.useContext(PersistedContext)

    function changeAppLanguage(LanguageCode: LanguagesCodesType) {
        i18n.changeLanguage(LanguageCode)
        session.preferences?.language.setAppLanguage(LanguageCode)
    }
    function changePrimaryLanguage(LanguageCode: LanguagesCodesType) {
        session.preferences?.language.setPrimaryLanguage(LanguageCode)
    }
    function changeContentLanguage(LanguageCode: LanguagesCodesType) {
        session.preferences?.content.setTranslationLanguage(LanguageCode)
    }

    const contextValue = {
        changeAppLanguage,
        changeContentLanguage,
        changePrimaryLanguage
    }
    return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}