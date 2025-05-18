import { MMKV } from "react-native-mmkv"
export const storage = new MMKV()

export function storageKeys() {
    const sessionId = storage.getString("@circle:sessionId")
    const baseKey = "@circle:"
    return {
        sessionId,
        baseKey,
        history: {
            search: baseKey + "history:search",
        },
        account: {
            coordinates: {
                latitude: baseKey + "account:coordinates:latitude",
                longitude: baseKey + "account:coordinates:longitude",
            },
            unreadNotificationsCount: baseKey + "account:unreadnotificationscount",
            blocked: baseKey + "account:block",
            muted: baseKey + "account:mute",
            last_active_at: baseKey + "account:lastactive",
            last_login_at: baseKey + "account:lastlogin",
            jwt: {
                expiration: baseKey + "account:jwt:expiration",
                token: baseKey + "account:jwt:token",
            },
        },
        statistics: {
            total_followers: baseKey + "statistics:totalfollowers",
            total_likes: baseKey + "statistics:totallikes",
            total_views: baseKey + "statistics:totalviews",
        },
        preferences: {
            primaryLanguage: baseKey + "preferences:language:primary",
            appLanguage: baseKey + "preferences:language:app",
            autoplay: baseKey + "preferences:content:autoplay",
            haptics: baseKey + "preferences:content:haptics",
            translation: baseKey + "preferences:content:translation",
            translationLanguage: baseKey + "preferences:content:translation:language",
            likeMoment: baseKey + "preferences:pushnotification:likemoment",
            newMemory: baseKey + "preferences:pushnotification:newmemory",
            addToMemory: baseKey + "preferences:pushnotification:addtomemory",
            followUser: baseKey + "preferences:pushnotification:followuser",
            viewUser: baseKey + "preferences:pushnotification:viewuser",
        },
        user: {
            id: baseKey + "user:id",
            name: baseKey + "user:name",
            username: baseKey + "user:username",
            description: baseKey + "user:description",
            verifyed: baseKey + "user:verifyed",
            profile_picture: {
                small: baseKey + "user:profile_picture:small",
                tiny: baseKey + "user:profile_picture:tiny",
            },
        },
        permissions: {
            postNotifications: baseKey + "permissions:postnotifications",
            firebaseMessaging: baseKey + "permissions:firebasemessaging",
        },
    }
}
