import { analytics } from "../../services/Analytics"

type UserShowActionsProps = {
    prefix?: string,
    user_id: number,
}

function setAnalyticsConfig() {
    analytics.serverEndpoint = ''
    analytics.setUserId('92899277979')
    analytics.setEventPrefix('profile')
}




async function username_pressed ({ user_id, prefix }: UserShowActionsProps) {
    setAnalyticsConfig()
    analytics.trackEvent(prefix? prefix : 'username', { user_id: user_id })
    await analytics.saveData()
    console.log(analytics.data)
}
async function profile_picture_pressed ({ user_id, prefix}: UserShowActionsProps) {
    setAnalyticsConfig()
    analytics.trackEvent(prefix? prefix : 'profile_picture', { user_id: user_id})
    await analytics.saveData()
    console.log(analytics.data)
}
async function follow_pressed ({ user_id, prefix}: UserShowActionsProps) {
    setAnalyticsConfig()
    analytics.setEventPrefix('profile')
    analytics.trackEvent(prefix? prefix : 'follow', { user_id: user_id})
    console.log(analytics.data)
}
async function unfollow_pressed ({ user_id, prefix}: UserShowActionsProps) {
    setAnalyticsConfig()
    analytics.setEventPrefix('profile')
    analytics.trackEvent(prefix? prefix : 'unfollow', { user_id: user_id})
    console.log(analytics.data)
}

export const UserShowActions = {
    UsernamePressed: username_pressed,
    ProfilePicturePressed: profile_picture_pressed,
    FollowPressed: follow_pressed,
    UnfollowPressed: unfollow_pressed
}