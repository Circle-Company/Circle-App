import React from "react"
import { useTranslation } from "react-i18next"
import { LanguageType, LanguagesCodesType, LanguagesListType } from "../../locales/LanguageTypes"
import i18n, { languageResources } from "../../locales/i18n"
import { languagesList } from "../../locales/languagesList"
import { useSetAppLanguageMutation } from "../../state/queries/preferences-language"
import PersistedContext from "../Persisted"
type LanguageProviderProps = { children: React.ReactNode }
type languageContextData = {
    t: any
    languagesList: LanguagesListType
    languageResources: typeof languageResources
    atualAppLanguage: LanguageType
    changeAppLanguage: (languageCode: LanguagesCodesType) => void
}
const LanguageContext = React.createContext<languageContextData>({} as languageContextData)

export function Provider({ children }: LanguageProviderProps) {
    const { session } = React.useContext(PersistedContext)
    const [atualAppLanguage, setAtualAppLanguage] = React.useState<LanguageType>({} as LanguageType)

    const setAppLanguageMutation = useSetAppLanguageMutation({
        appLanguage: atualAppLanguage.code,
    })

    function changeAppLanguage(LanguageCode: LanguagesCodesType) {
        i18n.changeLanguage(LanguageCode)
        session.preferences.setAppLanguage(LanguageCode)
    }

    function changeAtualAppLanguage() {
        languagesList.map((language) => {
            if (language.code == session.preferences.language.appLanguage)
                setAtualAppLanguage(language)
            else return
        })
        setAppLanguageMutation.mutate()
    }

    React.useEffect(() => {
        changeAtualAppLanguage()
    }, [session.preferences.language.appLanguage])

    React.useEffect(() => {
        i18n.changeLanguage(session.preferences.language.appLanguage)
        changeAtualAppLanguage()
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
