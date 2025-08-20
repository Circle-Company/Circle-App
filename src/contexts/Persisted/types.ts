import { SearchRenderItemReciveDataObjectProps } from "../../components/search/search-types"
import { userReciveDataProps } from "../../components/user_show/user_show-types"
import { LanguagesCodesType } from "../../locales/LanguageTypes"
import { AccountState } from "./persistedAccount"
import { PermissionsState } from "./persistedPermissions"
import { PreferencesState } from "./persistedPreferences"
import { StatisticsState } from "./persistedStatistics"
import { UserState } from "./persistedUser"

export type UserDataType = {
    id: string
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
    id: string
    name: string
    username: string
    description: string
    verifyed: boolean
    profile_picture: {
        small_resolution: string
        tiny_resolution: string
    }
    setId: (value: string) => void
    setName: (value: string) => void
    setUsername: (value: string) => void
    setDescription: (value: string) => void
    setVerifyed: (value: boolean) => void
    setProfilePicture: (value: { small_resolution: string; tiny_resolution: string }) => void
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
    coordinates: {
        latitude: number
        longitude: number
    }
    unreadNotificationsCount: number
    blocked: boolean
    muted: boolean
    last_active_at: string
    last_login_at: string
    jwtToken: string
    jwtExpiration: string
}
export type AccountDataReturnsType = {
    coordinates: {
        latitude: number
        longitude: number
    }
    unreadNotificationsCount: number
    blocked: boolean
    muted: boolean
    last_active_at: string
    last_login_at: string
    jwtToken: string
    setCoordinates: (value: { latitude: number; longitude: number }) => void
    setUnreadNotificationsCount: (value: number) => void
    setBlocked: (value: boolean) => void
    setMuted: (value: boolean) => void
    setLastActiveAt: (value: string) => void
    setLastLoginAt: (value: string) => void
    store: (value: AccountDataType) => AccountDataType
    load: () => AccountDataType
    remove: () => void
}

export type LanguageDataType = {
    translationLanguage: string
    appLanguage: LanguagesCodesType
}
export type LanguageDataStorageType = {
    translationLanguage: string
    appLanguage: string | LanguagesCodesType
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
    muteAudio: boolean
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

export type DeviceMetadataType = {
    deviceId: string
    deviceName: string
    platform: string
    version: string
    buildNumber: string
    appVersion: string
    systemVersion: string
    brand: string
    model: string
    carrier: string
    timezone: string
    locale: string
    isTablet: boolean
    hasNotch: boolean
    screenWidth: number
    screenHeight: number
    pixelDensity: number
    fontScale: number
    // Capacidade do dispositivo
    totalMemory: number
    usedMemory: number
    availableMemory: number
    totalDiskCapacity: number
    freeDiskStorage: number
    usedDiskStorage: number
    batteryLevel: number
    isLowPowerModeEnabled: boolean
    cpuArchitecture: string
    deviceType: string
    maxMemory: number
    lastUpdatedAt: string
}

export type DeviceMetadataState = {
    deviceId: string
    deviceName: string
    platform: string
    version: string
    buildNumber: string
    appVersion: string
    systemVersion: string
    brand: string
    model: string
    carrier: string
    timezone: string
    locale: string
    isTablet: boolean
    hasNotch: boolean
    screenWidth: number
    screenHeight: number
    pixelDensity: number
    fontScale: number
    // Capacidade do dispositivo
    totalMemory: number
    usedMemory: number
    availableMemory: number
    totalDiskCapacity: number
    freeDiskStorage: number
    usedDiskStorage: number
    batteryLevel: number
    isLowPowerModeEnabled: boolean
    cpuArchitecture: string
    deviceType: string
    maxMemory: number
    lastUpdatedAt: string
    setDeviceId: (value: string) => void
    setDeviceName: (value: string) => void
    setPlatform: (value: string) => void
    setVersion: (value: string) => void
    setBuildNumber: (value: string) => void
    setAppVersion: (value: string) => void
    setSystemVersion: (value: string) => void
    setBrand: (value: string) => void
    setModel: (value: string) => void
    setCarrier: (value: string) => void
    setTimezone: (value: string) => void
    setLocale: (value: string) => void
    setIsTablet: (value: boolean) => void
    setHasNotch: (value: boolean) => void
    setScreenWidth: (value: number) => void
    setScreenHeight: (value: number) => void
    setPixelDensity: (value: number) => void
    setFontScale: (value: number) => void
    setTotalMemory: (value: number) => void
    setUsedMemory: (value: number) => void
    setAvailableMemory: (value: number) => void
    setTotalDiskCapacity: (value: number) => void
    setFreeDiskStorage: (value: number) => void
    setUsedDiskStorage: (value: number) => void
    setBatteryLevel: (value: number) => void
    setIsLowPowerModeEnabled: (value: boolean) => void
    setCpuArchitecture: (value: string) => void
    setDeviceType: (value: string) => void
    setMaxMemory: (value: number) => void
    setLastUpdatedAt: (value: string) => void
    set: (value: DeviceMetadataType) => void
    load: () => void
    remove: () => void
    updateAll: () => Promise<DeviceMetadataType | void>
}

export type DeviceDataType = {
    permissions: PermissionsState
    metadata: DeviceMetadataState
}
