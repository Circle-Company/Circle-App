//@ts-ignore
import { APP_VERSION, DEBUG, MIXPANEL_KEY, NODE_ENV } from "@env"
import emails from "./emails"
import metadata from "./metadata"

const environment = {
    APP_VERSION: APP_VERSION,
    NODE_ENV: NODE_ENV,
    DEBUG: NODE_ENV !== "production" && DEBUG,
    TEST: NODE_ENV === "test",
    PRODUCTION: NODE_ENV === "production",
}

const api = {
    ENDPOINT: "192.168.15.4:3000",
    API_VERSION: "1.0.0",
}

const analytics = {
    MIXPANEL_KEY: MIXPANEL_KEY,
}

const log = {}

const required = {
    NODE_ENV: NODE_ENV,
    MIXPANEL_KEY: MIXPANEL_KEY,
    APPLICATION_NAME: metadata.APPLICATION_NAME,
}

const options = {
    SUPPORT_URL: emails.SUPPORT_LINK,
    APPLICATION_NAME: metadata.APPLICATION_NAME,
    APPLICATION_SHORT_NAME: metadata.APPLICATION_SHORT_NAME,
    APPLICATION_DESCRIPTION: metadata.APPLICATION_DESCRIPTION,
    ORGANIZATION_URL: emails.ORGANIZATION_LINK,
    ORGANIZATION_NAME: metadata.ORGANIZATION_NAME,
}

// Check if all required configs are present
Object.entries(required).map((entry) => {
    if (!entry[1]) {
        throw new Error(`ERROR: "${entry[0]}" env variable is missing.`)
    }
    return entry
})

export default {
    ...api,
    ...environment,
    ...log,
    ...options,
    ...analytics,
}
