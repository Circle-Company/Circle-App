import { analytics } from "../../services/Analytics"
import { useNavigation } from "@react-navigation/native"

type UserShowActionsProps = {
    prefix?: string,
    user_id: number,
    user?: any,
    action: () => void
}

function setAnalyticsConfig() {
    analytics.serverEndpoint = ''
    analytics.setUserId('92899277979')
    analytics.setEventPrefix('profile')
}

async function username_pressed ({ user_id, prefix, action, user}: UserShowActionsProps) {
    await action(user.username)
    setAnalyticsConfig()
    analytics.trackEvent(prefix? prefix : 'username', { user_id: user_id })
    await analytics.saveData()
}
async function profile_picture_pressed ({ user_id, prefix, action, user}: UserShowActionsProps) {
    await action(user.username)
    setAnalyticsConfig()
    analytics.trackEvent(prefix? prefix : 'profile_picture', { user_id: user_id})
    await analytics.saveData()
}
async function follow_pressed ({ user_id, prefix, action}: UserShowActionsProps) {
    await action(user_id)
    setAnalyticsConfig()
    analytics.setEventPrefix('profile')
    analytics.trackEvent(prefix? prefix : 'follow', { user_id: user_id})
}
async function unfollow_pressed ({ user_id, prefix, action}: UserShowActionsProps) {
    await action(user_id)
    setAnalyticsConfig()
    analytics.setEventPrefix('profile')
    analytics.trackEvent(prefix? prefix : 'unfollow', { user_id: user_id})
}

export const UserShowActions = {
    UsernamePressed: username_pressed,
    ProfilePicturePressed: profile_picture_pressed,
    FollowPressed: follow_pressed,
    UnfollowPressed: unfollow_pressed
}