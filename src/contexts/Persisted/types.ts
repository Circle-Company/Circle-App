import { userReciveDataProps } from "../../components/user_show/user_show-types"
import { LanguagesCodesType } from "../../locales/LanguageTypes"

export type AccountDataType = {
    user: userReciveDataProps,
    jwtToken: string
}
export type LanguageDataType = {
    primaryLanguage: LanguagesCodesType
    appLanguage: LanguagesCodesType,
}
export type ContentDataType = {
    disableAutoplay: boolean
    disableHaptics: boolean
    disableTranslation: boolean
    translationLanguage: LanguagesCodesType
}
export type PreferencesDataType = {
    language: LanguageDataType
    content: ContentDataType
}
export type SessionDataType = {
    account: AccountDataType,
    preferences: PreferencesDataType 
}
export type PersistedContextData = {
    session: SessionDataType
    storeSessionData: () => void
    getSessionData: () => void
}