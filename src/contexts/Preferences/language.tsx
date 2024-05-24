import React from "react"
import { LanguageType, LanguagesCodesType, LanguagesListType } from "../../locales/LanguageTypes"
import i18n, { languageResources } from '../../locales/i18n'
import PersistedContext from "../Persisted"
import { useTranslation } from "react-i18next"
import { languagesList } from "../../locales/languagesList"

type LanguageProviderProps = { children: React.ReactNode }
type languageContextData = {
    t: any
    languagesList: LanguagesListType
    languageResources: typeof languageResources
    atualAppLanguage: LanguageType
    changePrimaryLanguage: (LanguageCode: LanguagesCodesType) => void
    changeAppLanguage: (languageCode: LanguagesCodesType) => void
    changeContentLanguage: (LanguageCode: LanguagesCodesType) => void
}
const LanguageContext = React.createContext<languageContextData>({} as languageContextData)

export function Provider({ children }: LanguageProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [ atualAppLanguage, setAtualAppLanguage ] = React.useState<LanguageType>({} as LanguageType)

    function changeAppLanguage(LanguageCode: LanguagesCodesType) {
        i18n.changeLanguage(LanguageCode)
        session.preferences.setAppLanguage(LanguageCode)
    }
    function changePrimaryLanguage(LanguageCode: LanguagesCodesType) {
        session.preferences.setPrimaryLanguage(LanguageCode)
    }
    function changeContentLanguage(LanguageCode: LanguagesCodesType) {
        session.preferences.setTranslationLanguage(LanguageCode)
    }

    function changeAtualAppLanguage() {
        languagesList.map((language) => {
            if(language.code == session.preferences.language.appLanguage) setAtualAppLanguage(language)
             else return
        })
    }

    React.useEffect(() => {
        changeAtualAppLanguage()
    }, [session.preferences.language.appLanguage])

    React.useEffect(() => {
        i18n.changeLanguage(session.preferences.language.appLanguage)
        changeAtualAppLanguage()
    }, [])

    const {t} = useTranslation()

    const contextValue = {
        languagesList,
        t: t,
        atualAppLanguage, 
        languageResources,
        changeAppLanguage,
        changeContentLanguage,
        changePrimaryLanguage
    }
    return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export default LanguageContext