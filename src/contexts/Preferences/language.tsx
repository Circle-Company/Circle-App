import React from "react"
import { LanguagesCodesType } from "../../locales/LanguageTypes"
import i18n from '../../locales/i18n'

type LanguageProviderProps = { children: React.ReactNode }
type languageContextData = {
    changeAppLanguage: (languageCode: LanguagesCodesType) => void
    changeContentLanguage: (LanguageCode: LanguagesCodesType) => void
}
const LanguageContext = React.createContext<languageContextData>({} as languageContextData)

export function Provider({ children }: LanguageProviderProps) {

    function changeAppLanguage(LanguageCode: LanguagesCodesType) {
        i18n.changeLanguage(LanguageCode)
    }
    function changeContentLanguage(LanguageCode: LanguagesCodesType) {
        i18n.changeLanguage(LanguageCode)
    }

    const contextValue = { changeAppLanguage, changeContentLanguage }
    return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}