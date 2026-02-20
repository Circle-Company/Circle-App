import { AccountMoment } from "@/queries/account"

export { AccountMoment }

export type SessionUser = {
    id: string
    username: string
    name: string | null
    description: string | null
    richDescription: string | null
    isVerified: boolean
    isActive: boolean
    profilePicture: string
}

export type SessionStatus = {
    accessLevel: string
    verified: boolean
    deleted: boolean
    blocked: boolean
}

export type SessionPreferences = {
    appLanguage: string
    translationLanguage: string
    appTimezone: number
    timezoneCode: string
    disableAutoplay: boolean
    disableHaptics: boolean
    disableTranslation: boolean
}

export type AccountDataType = {
    jwtToken: string
    jwtExpiration: string
    refreshToken?: string
    blocked: boolean
    accessLevel: string
    verified: boolean
    deleted: boolean
    moments?: AccountMoment[]
    terms?: AccountTerms
}

export type AccountTerms = {
    agreed: boolean
    version: string
    agreedAt: string
}

export type PreferencesLanguage = {
    appLanguage: string
    translationLanguage: string
}

export type PreferencesContent = {
    disableAutoplay: boolean
    disableHaptics: boolean
    disableTranslation: boolean
    disableContentWarning: boolean
    muteAudio: boolean
}

export type PreferencesDataType = {
    appTimezone: number
    timezoneCode: string
    language: PreferencesLanguage
    content: PreferencesContent
}

export type UserDataType = SessionUser

export type MetricsDataType = {
    totalFollowers: number
    totalFollowing: number
    totalLikesReceived: number
    totalViewsReceived: number
    followerGrowthRate30d: number
    engagementGrowthRate30d: number
    interactionsGrowthRate30d: number
}

export type PermissionsData = {
    postNotifications: boolean
    firebaseMessaging: boolean
}

export type DeviceDataType = {
    permissions: PermissionsData
}

export type SessionDataType = {
    token: string
    expiresIn: number
    expiresAt: string
    user: SessionUser
    status: SessionStatus
    preferences: PreferencesDataType
    account: AccountDataType & {
        coordinates: {
            latitude: number
            longitude: number
        }
    }
    metrics: MetricsDataType
}

export type AuthSessionPayload = {
    success?: boolean
    session: {
        user: {
            id: string
            username: string
            name?: string | null
            description?: string | null
            profilePicture?: string
        }
        metrics?: {
            totalLikesReceived?: number
            totalViewsReceived?: number
            totalSharesReceived?: number
            totalCommentsReceived?: number
            totalMomentsCreated?: number
            totalLikesGiven?: number
            totalCommentsGiven?: number
            totalSharesGiven?: number
            totalFollowsGiven?: number
            totalReportsGiven?: number
            totalFollowers?: number
            totalFollowing?: number
            followerGrowthRate30d?: number
            engagementGrowthRate30d?: number
            interactionsGrowthRate30d?: number
            lastMetricsUpdate?: string
        }
        status?: {
            accessLevel?: string
            verified?: boolean
            deleted?: boolean
            blocked?: boolean
        }
        terms?: {
            termsAndConditionsAgreed?: boolean
            termsAndConditionsAgreedVersion?: string
            termsAndConditionsAgreedAt?: string
        }
        preferences?: {
            app?: {
                language?: string
                timezone?: number
                timezoneCode?: string
                enableAutoplayFeed?: boolean
                enableHapticFeedback?: boolean
                enableContentWarning?: boolean
            }
            notifications?: {}
        }
        token: string
        expiresIn: number
        refreshToken?: string
        refreshExpiresIn?: number
    }
}
