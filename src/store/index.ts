import { createMMKV } from "react-native-mmkv"

export const storage = createMMKV()

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
            blocked: baseKey + "account:block",
            muted: baseKey + "account:mute",
            last_active_at: baseKey + "account:lastactive",
            last_login_at: baseKey + "account:lastlogin",
            jwt: {
                expiration: baseKey + "account:jwt:expiration",
                token: baseKey + "account:jwt:token",
                refreshToken: baseKey + "account:jwt:refreshtoken",
            },
            moments: baseKey + "account:moments",
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
            muteAudio: baseKey + "preferences:content:muteaudio",
            likeMoment: baseKey + "preferences:pushnotification:likemoment",
            newMemory: baseKey + "preferences:pushnotification:newmemory",
            addToMemory: baseKey + "preferences:pushnotification:addtomemory",
            followUser: baseKey + "preferences:pushnotification:followuser",
            viewUser: baseKey + "preferences:pushnotification:viewuser",
            appTimezone: baseKey + "preferences:timezone:offset",
            timezoneCode: baseKey + "preferences:timezone:code",
        },
        user: {
            id: baseKey + "user:id",
            name: baseKey + "user:name",
            username: baseKey + "user:username",
            description: baseKey + "user:description",
            verified: baseKey + "user:verified",
            profile_picture: {
                small: baseKey + "user:profile_picture:small",
                tiny: baseKey + "user:profile_picture:tiny",
            },
        },
        permissions: {
            postNotifications: baseKey + "permissions:postnotifications",
            firebaseMessaging: baseKey + "permissions:firebasemessaging",
        },
        deviceMetadata: {
            deviceId: baseKey + "device:metadata:id",
            deviceName: baseKey + "device:metadata:name",
            platform: baseKey + "device:metadata:platform",
            version: baseKey + "device:metadata:version",
            buildNumber: baseKey + "device:metadata:buildnumber",
            appVersion: baseKey + "device:metadata:appversion",
            systemVersion: baseKey + "device:metadata:systemversion",
            brand: baseKey + "device:metadata:brand",
            model: baseKey + "device:metadata:model",
            carrier: baseKey + "device:metadata:carrier",
            timezone: baseKey + "device:metadata:timezone",
            locale: baseKey + "device:metadata:locale",
            isTablet: baseKey + "device:metadata:istablet",
            hasNotch: baseKey + "device:metadata:hasnotch",
            screenWidth: baseKey + "device:metadata:screenwidth",
            screenHeight: baseKey + "device:metadata:screenheight",
            pixelDensity: baseKey + "device:metadata:pixeldensity",
            fontScale: baseKey + "device:metadata:fontscale",
            // Capacidade do dispositivo
            totalMemory: baseKey + "device:metadata:totalmemory",
            usedMemory: baseKey + "device:metadata:usedmemory",
            availableMemory: baseKey + "device:metadata:availablememory",
            totalDiskCapacity: baseKey + "device:metadata:totaldiskcapacity",
            freeDiskStorage: baseKey + "device:metadata:freediskstorage",
            usedDiskStorage: baseKey + "device:metadata:useddiskstorage",
            batteryLevel: baseKey + "device:metadata:batterylevel",
            isLowPowerModeEnabled: baseKey + "device:metadata:islowpowermodeenabled",
            cpuArchitecture: baseKey + "device:metadata:cpuarchitecture",
            deviceType: baseKey + "device:metadata:devicetype",
            maxMemory: baseKey + "device:metadata:maxmemory",
            lastUpdatedAt: baseKey + "device:metadata:lastupdatedat",
        },
    }
}
