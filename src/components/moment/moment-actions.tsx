import { analytics } from "../../services/Analytics"

type MomentActionsProps = {
    prefix?: string
    moment_id: number
}


function setAnalyticsConfig() {
    analytics.serverEndpoint = ''
    analytics.setUserId('92899277979')
    analytics.setEventPrefix('moment')
}

async function view({prefix, moment_id}: MomentActionsProps) {
    setAnalyticsConfig()
    analytics.trackEvent(prefix? prefix : 'view', { moment_id: moment_id })
    await analytics.saveData()
    console.log(analytics.data)
}
async function like_pressed({prefix, moment_id}: MomentActionsProps) {
    setAnalyticsConfig()
    analytics.trackEvent(prefix? prefix : 'like', { moment_id: moment_id })
    await analytics.saveData()
    console.log(analytics.data)
}
async function unlike_pressed({prefix, moment_id}: MomentActionsProps) {
    setAnalyticsConfig()
    analytics.trackEvent(prefix? prefix : 'unlike', { moment_id: moment_id })
    await analytics.saveData()
    console.log(analytics.data)
}

export const MomentActions = {
    View: view,
    LikePressed: like_pressed,
    UnlikePressed: unlike_pressed
}