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
    unreadNotificationsCount: number
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

export type PermissionsData = {
    postNotifications: boolean
    firebaseMessaging: boolean
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
}
