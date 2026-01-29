import { createMMKV } from "react-native-mmkv"

export const storage = createMMKV()

// Safe storage helpers to be reused across stores
export const safeDelete = (key: string) => {
    try {
        const anyStorage = storage as any
        if (typeof anyStorage.delete === "function") {
            anyStorage.delete(key)
        } else if (typeof anyStorage.removeItem === "function") {
            anyStorage.removeItem(key)
        } else {
            // Fallback: overwrite with empty string when deletion isn't available
            storage.set(key, "")
        }
    } catch {
        // noop
    }
}

export const safeSet = (key: string, value: any) => {
    if (value === undefined || value === null) {
        safeDelete(key)
    } else {
        storage.set(key, value)
    }
}

export function storageKeys() {
    const sessionId = storage.getString("@circle:sessionId")
    const baseKey = "@circle:"
    return {
        sessionId,
        baseKey,
        account: {
            coordinates: {
                latitude: baseKey + "account:coordinates:latitude",
                longitude: baseKey + "account:coordinates:longitude",
            },
            blocked: baseKey + "account:block",
            accessLevel: baseKey + "account:accesslevel",
            verified: baseKey + "account:verified",
            deleted: baseKey + "account:deleted",
            jwt: {
                expiration: baseKey + "account:jwt:expiration",
                token: baseKey + "account:jwt:token",
                refreshToken: baseKey + "account:jwt:refreshtoken",
            },
            moments: baseKey + "account:moments",
            totalMoments: baseKey + "account:totalmoments",
            terms: {
                agreed: baseKey + "account:terms:agreed",
                version: baseKey + "account:terms:version",
                agreedAt: baseKey + "account:terms:agreedat",
            },
        },
        statistics: {
            totalFollowers: baseKey + "statistics:totalFollowers",
            totalFollowing: baseKey + "statistics:totalFollowing",
            totalLikes: baseKey + "statistics:totalLikes",
            totalViews: baseKey + "statistics:totalViews",
            followerGrowthRate30d: baseKey + "statistics:followerGrowthRate30d",
            engagementGrowthRate30d: baseKey + "statistics:engagementGrowthRate30d",
            interactionsGrowthRate30d: baseKey + "statistics:interactionsGrowthRate30d",
        },
        preferences: {
            primaryLanguage: baseKey + "preferences:language:primary",
            appLanguage: baseKey + "preferences:language:app",
            autoplay: baseKey + "preferences:content:autoplay",
            haptics: baseKey + "preferences:content:haptics",
            translation: baseKey + "preferences:content:translation",
            translationLanguage: baseKey + "preferences:content:translation:language",
            muteAudio: baseKey + "preferences:content:muteaudio",
            appTimezone: baseKey + "preferences:timezone:offset",
            timezoneCode: baseKey + "preferences:timezone:code",
        },
        user: {
            id: baseKey + "user:id",
            name: baseKey + "user:name",
            username: baseKey + "user:username",
            description: baseKey + "user:description",
            richDescription: baseKey + "user:description:rich",
            verified: baseKey + "user:verified",
            active: baseKey + "user:active",
            profilePicture: "user:profilepicture",
        },
        permissions: {
            postNotifications: baseKey + "permissions:postnotifications",
            firebaseMessaging: baseKey + "permissions:firebasemessaging",
        },
    }
}

// Ephemeral like-pressed memory namespace and helpers
export const LIKE_PRESSED_NS = "@circle:like:pressed:"

export const clearKeysByPrefix = (prefix: string) => {
    try {
        const anyStorage = storage as any
        const keys: string[] =
            typeof anyStorage.getAllKeys === "function" ? anyStorage.getAllKeys() : []
        for (const k of keys) {
            if (typeof k === "string" && k.startsWith(prefix)) {
                safeDelete(k)
            }
        }
    } catch {
        // noop
    }
}

export const clearLikePressedNamespace = () => {
    clearKeysByPrefix(LIKE_PRESSED_NS)
}
