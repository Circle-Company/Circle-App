import { SearchRenderItemReciveDataObjectProps } from "../../components/search/search-types"
import { userReciveDataProps } from "../../components/user_show/user_show-types"
import { LanguagesCodesType } from "../../locales/LanguageTypes"
import { AccountState } from "./persistedAccount"
import { PreferencesState } from "./persistedPreferences"
import { StatisticsState } from "./persistedStatistics"
import { UserState } from "./persistedUser"

export type UserDataType = {
    id: number
    name: string
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
    name: string
    username: string
    description: string
    verifyed: boolean
    profile_picture: {
        small_resolution: string
        tiny_resolution: string
    }
    setId: (value: number) => void
    setName: (value: string) => void;
    setUsername: (value: string) => void
    setDescription: (value: string) => void
    setVerifyed: (value: boolean) => void
    setProfilePicture: (value: {
        small_resolution: String
        tiny_resolution: String
    }) => void
    getUser: (id: number) => Promise<UserState>
    storeUser: (value: userReciveDataProps) => userReciveDataProps
    loadUserFromStorage: () => userReciveDataProps
    removeUserFromStorage: () => void
}

export type StatisticsDataType = {
    total_followers_num: number
    total_likes_num: number
    total_views_num: number
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

export type HistoryDataStorageType = {
    search: SearchRenderItemReciveDataObjectProps[] | []
}


export type SessionDataType = {
    history: HistoryDataStorageType
    user: UserDataReturnsType
    account: AccountState
    preferences: PreferencesState
    statistics: StatisticsState
}