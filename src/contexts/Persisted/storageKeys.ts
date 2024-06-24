import { storage } from "../../store"

export function storageKeys () {

    const sessionId = storage.getNumber('@circle:sessionId')
    const baseKey = `@circle:sessionId=${sessionId}:`
    return {
        history: {
            search: baseKey + 'history:search',
        },
        account: {
            blocked: baseKey + 'account:block',
            muted: baseKey + 'account:mute',
            last_active_at: baseKey + 'account:lastactive',
            last_login_at: baseKey + 'account:lastlogin'
        },
        statistics: {
            total_followers: baseKey + 'statistics:totalfollowers',
            total_likes: baseKey + 'statistics:totallikes',
            total_views: baseKey + 'statistics:totalviews',
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
            name: baseKey + 'user:name',
            username: baseKey + 'user:username',
            description: baseKey + 'user:description',
            verifyed: baseKey + 'user:verifyed',
            profile_picture: {
                small: baseKey + 'user:profile_picture:small',
                tiny: baseKey + 'user:profile_picture:tiny'
            } 
        }        
    }
}