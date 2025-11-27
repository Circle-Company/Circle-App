export type SessionUser = {
    id: string
    username: string
    name: string | null
    description: string | null
    richDescription: string | null
    isVerified: boolean
    isActive: boolean
    profilePicture: string | null
}

export type SessionStatus = {
    accessLevel: string
    verified: boolean
    deleted: boolean
    blocked: boolean
    muted: boolean
    createdAt: string
    updatedAt: string
}

export type SessionPreferences = {
    appLanguage: string
    translationLanguage: string
    appTimezone: number
    timezoneCode: string
    disableAutoplay: boolean
    disableHaptics: boolean
    disableTranslation: boolean
    disableLikeMomentPushNotification: boolean
    disableNewMemoryPushNotification: boolean
    disableAddToMemoryPushNotification: boolean
    disableFollowUserPushNotification: boolean
    disableViewUserPushNotification: boolean
    disableNewsPushNotification: boolean
    disableSugestionsPushNotification: boolean
    disableAroundYouPushNotification: boolean
    createdAt: string
    updatedAt: string
}

export type SessionSecurityInfo = {
    riskLevel: string
    status: string
    message: string
    additionalData?: Record<string, unknown>
}

export type AccountDataType = {
    jwtToken: string
    jwtExpiration: string
    blocked: boolean
    muted: boolean
    accessLevel: string
    verified: boolean
    deleted: boolean
    createdAt: string
    updatedAt: string
    last_active_at: string
    last_login_at: string
}

export type PreferencesLanguage = {
    appLanguage: string
    translationLanguage: string
}

export type PreferencesContent = {
    disableAutoplay: boolean
    disableHaptics: boolean
    disableTranslation: boolean
    muteAudio: boolean
}

export type PreferencesPushNotifications = {
    disableLikeMoment: boolean
    disableNewMemory: boolean
    disableAddToMemory: boolean
    disableFollowUser: boolean
    disableViewUser: boolean
}

export type PreferencesDataType = {
    appTimezone: number
    timezoneCode: string
    language: PreferencesLanguage
    content: PreferencesContent
    pushNotifications: PreferencesPushNotifications
}

export type UserDataType = SessionUser

export type HistoryDataStorageType = {
    search: unknown[]
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
    permissions: PermissionsData
    metadata: DeviceMetadataState
}

export type SessionDataType = {
    token: string
    expiresIn: number
    expiresAt: string
    user: SessionUser
    status: SessionStatus
    preferences: PreferencesDataType
    securityInfo?: SessionSecurityInfo
    account: AccountDataType & {
        coordinates: {
            latitude: number
            longitude: number
        }
    }
    statistics?: StatisticsDataType
    history?: HistoryDataStorageType
}
