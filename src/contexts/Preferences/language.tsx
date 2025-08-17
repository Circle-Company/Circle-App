import { LanguageType, LanguagesCodesType, LanguagesListType } from "../../locales/LanguageTypes"
import i18n, { languageResources } from "../../locales/i18n"

import PersistedContext from "../Persisted"
import React from "react"
import { languagesList } from "../../locales/languagesList"
import { useSetAppLanguageMutation } from "../../state/queries/preferences-language"
import { useTranslation } from "react-i18next"

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
    const [atualAppLanguage, setAtualAppLanguage] = React.useState<LanguageType>(languagesList[0])

    const setAppLanguageMutation = useSetAppLanguageMutation({
        appLanguage: atualAppLanguage.code,
    })

    function changeAppLanguage(languageCode: LanguagesCodesType) {
        i18n.changeLanguage(languageCode)

        if (session?.preferences?.setAppLanguage) {
            session.preferences.setAppLanguage(languageCode)
        } else {
            console.warn(
                "Não foi possível salvar a preferência de idioma: session.preferences indisponível"
            )
        }
    }

    function changeAtualAppLanguage() {
        const currentLanguageCode = session?.preferences?.language?.appLanguage

        if (!currentLanguageCode) {
            setAtualAppLanguage(languagesList[0])
            return
        }

        const selectedLanguage = languagesList.find(
            (language) => language.code === currentLanguageCode
        )

        if (selectedLanguage) {
            setAtualAppLanguage(selectedLanguage)
        } else {
            setAtualAppLanguage(languagesList[0])
        }

        if (currentLanguageCode) {
            setAppLanguageMutation.mutate()
        }
    }

    React.useEffect(() => {
        if (session?.preferences?.language?.appLanguage) {
            changeAtualAppLanguage()
        }
    }, [session?.preferences?.language?.appLanguage])

    React.useEffect(() => {
        const defaultLanguage = session?.preferences?.language?.appLanguage || "en"
        i18n.changeLanguage(defaultLanguage)
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
