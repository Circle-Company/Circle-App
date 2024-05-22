import { storage } from "../../store"

export function storageKeys () {

    const sessionId = storage.getNumber('@circle:sessionId')
    const baseKey = `@circle:sessionId=${sessionId}:`
    return {
        account: {
            blocked: baseKey + 'account:block',
            muted: baseKey + 'account:mute',
            last_active_at: baseKey + 'account:lastactive',
            last_login_at: baseKey + 'account:lastlogin'
        },
        preferences: {
            primaryLanguage: baseKey + 'preferences:language:primary',
            appLanguage: baseKey + 'preferences:language:app',
            autoplay: baseKey + 'preferences:content:autoplay',
            haptics: baseKey + 'preferences:content:haptics',
            translation: baseKey + 'preferences:content:translation',
            translationLanguage: baseKey + 'preferences:content:translation:language'
        },
        user: {
            id: baseKey + 'user:id',
            username: baseKey + 'user:username',
            verifyed: baseKey + 'user:verifyed',
            profile_picture: baseKey + 'user:profile_picture'
        }        
    }
}