import { SearchRenderItemReciveDataObjectProps } from "../../components/search/search-types"
import { userReciveDataProps } from "../../components/user_show/user_show-types"
import { LanguagesCodesType } from "../../locales/LanguageTypes"
import { AccountState } from "./persistedAccount"
import { PermissionsState } from "./persistedPermissions"
import { PreferencesState } from "./persistedPreferences"
import { StatisticsState } from "./persistedStatistics"
import { UserState } from "./persistedUser"

export type UserDataType = {
    id: number
    name: string
    username: string
    description: string
    verifyed: boolean
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
    setName: (value: string) => void
    setUsername: (value: string) => void
    setDescription: (value: string) => void
    setVerifyed: (value: boolean) => void
    setProfilePicture: (value: { small_resolution: String; tiny_resolution: String }) => void
    get: (id: number) => Promise<UserState>
    store: (value: userReciveDataProps) => userReciveDataProps
    load: () => userReciveDataProps
    remove: () => void
}

export type StatisticsDataType = {
    total_followers_num: number
    total_likes_num: number
    total_views_num: number
}

export type PermissionsData = {
    postNotifications: boolean
    firebaseMessaging: boolean
}

export type AccountDataType = {
    blocked: boolean
    muted: boolean
    last_active_at: string
    last_login_at: string
    firebasePushToken: string
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
    translationLanguage: string
    appLanguage: LanguagesCodesType
}
export type LanguageDataStorageType = {
    translationLanguage: string
    appLanguage: LanguagesCodesType
}
export type LanguageDataReturnsType = {
    translationLanguage: string
    appLanguage: LanguagesCodesType
    setTranslationLanguage: (value: LanguagesCodesType) => void
    setAppLanguage: (value: LanguagesCodesType) => void
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
}

export type PushNotificationsStorageType = {
    disableLikeMoment: boolean
    disableNewMemory: boolean
    disableAddToMemory: boolean
    disableFollowUser: boolean
    disableViewUser: boolean
}

export type PushNotificationsReturnsType = {
    disableLikeMoment: boolean
    disableNewMemory: boolean
    disableAddToMemory: boolean
    disableFollowUser: boolean
    disableViewUser: boolean
    setDisableLikeMoment: (value: boolean) => void
    setDisableNewMemory: (value: boolean) => void
    setDisableAddToMemory: (value: boolean) => void
    setDisableFollowUser: (value: boolean) => void
    setDisableViewUser: (value: boolean) => void
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
    pushNotifications: PushNotificationsStorageType
}
export type PreferencesDataStorageType = {
    language: LanguageDataStorageType
    content: ContentDataStorageType
    pushNotifications: PushNotificationsStorageType
}

export type PreferencesDataReturnsType = {
    language: LanguageDataReturnsType
    content: ContentDataReturnsType
    pushNotifications: PushNotificationsReturnsType
    store: (value: PreferencesDataType) => PreferencesDataStorageType
    load: () => PreferencesDataStorageType
    remove: () => void
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

export type DeviceDataType = {
    permissions: PermissionsState
}
