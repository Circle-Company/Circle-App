import { userReciveDataProps } from "../../components/user_show/user_show-types"
import { LanguagesCodesType } from "../../locales/LanguageTypes"
import { AccountState } from "./persistedAccount"
import { PreferencesState } from "./persistedPreferences"

export type UserDataType = {
    id: number
    username: string
    description: string
    verifyed: boolean,
    profile_picture: {
        small_resolution: string
        tiny_resolution: string
    }
}
export type UserDataReturnsType = {
    id: number
    username: string
    verifyed: boolean
    profile_picture: {
        small_resolution: string
        tiny_resolution: string
    }
    setId: (value: number) => void
    setUsername: (value: string) => void
    setDescription: (value: string) => void
    setVerifyed: (value: boolean) => void
    setProfilePicture: (value: {
        small_resolution: String
        tiny_resolution: String
    }) => void
    storeUser: (value: userReciveDataProps) => userReciveDataProps
    loadUserFromStorage: () => userReciveDataProps
    removeUserFromStorage: () => void
}

export type AccountDataType = {
    blocked: boolean
    muted: boolean
    last_active_at: string
    last_login_at: string
}
export type AccountDataReturnsType = {
    blocked: boolean
    muted: boolean
    last_active_at: string
    last_login_at: string
    setBlocked: (value: boolean) => void
    setMuted: (value: boolean) => void
    setLastActiveAt: (value: string) => void
    setLastLoginAt: (value: string) => void
    storeAccount: (value: AccountDataType) => AccountDataType
    loadAccountFromStorage: () => AccountDataType
    removeAccountFromStorage: () => void
}

export type LanguageDataType = {
    primaryLanguage: LanguagesCodesType
    appLanguage: LanguagesCodesType
}
export type LanguageDataStorageType = {
    primaryLanguage: string
    appLanguage: string
}
export type LanguageDataReturnsType = {
    primaryLanguage: LanguagesCodesType
    appLanguage: LanguagesCodesType
    setPrimaryLanguage: (value: LanguagesCodesType) => void
    setAppLanguage: (value: LanguagesCodesType) => void
    setLanguage: (value: LanguageDataType) => void
}

export type ContentDataType = {
    disableAutoplay: boolean
    disableHaptics: boolean
    disableTranslation: boolean
    translationLanguage: LanguagesCodesType
}
export type ContentDataStorageType = {
    disableAutoplay: boolean
    disableHaptics: boolean
    disableTranslation: boolean
    translationLanguage: string
}
export type ContentDataReturnsType = {
    disableAutoplay: boolean
    disableHaptics: boolean
    disableTranslation: boolean
    translationLanguage: string
    setDisableAutoPlay: (value: boolean) => void
    setDisableHaptics: (value: boolean) => void
    setDisableTranslation: (value: boolean) => void
    setTranslationLanguage: (value: LanguagesCodesType) => void
    setContent: (value: ContentDataType) => void
}

export type PreferencesDataType = {
    language: LanguageDataType
    content: ContentDataType
}
export type PreferencesDataStorageType = {
    language: LanguageDataStorageType
    content: ContentDataStorageType
}

export type PreferencesDataReturnsType = {
    language: LanguageDataReturnsType
    content: ContentDataReturnsType
    
    storePreferences: (value: PreferencesDataType) => PreferencesDataStorageType
    loadPreferencesFromStorage: () => PreferencesDataStorageType
    removePreferencesFromStorage: () => void
}


export type SessionDataType = {
    user: UserDataReturnsType
    account: AccountState
    preferences: PreferencesState
    jwtToken: string | null
    setJwtToken: React.Dispatch<React.SetStateAction<string | null>>
}
