//@ts-ignore
import { APP_VERSION, DEBUG, MIXPANEL_KEY, NODE_ENV } from "@env"

import emails from "./emails"
import metadata from "./metadata"
import SettingsPrivacyPolicy from "@/pages/app/Settings/terms.privacy"

const environment = {
    APP_VERSION: APP_VERSION,
    NODE_ENV: NODE_ENV,
    DEBUG: NODE_ENV !== "production" && DEBUG,
    TEST: NODE_ENV === "test",
    PRODUCTION: NODE_ENV === "production",
}

const api = {
    ENDPOINT: "192.168.15.17:3000",
    API_VERSION: "1.0.0",
}

const required = {
    ...api,
    NODE_ENV: NODE_ENV,
    APPLICATION_NAME: metadata.APPLICATION_NAME,
}

const options = {
    SUPPORT_URL: emails.SUPPORT_EMAIL,
    APPLICATION_NAME: metadata.APPLICATION_NAME,
    APPLICATION_SHORT_NAME: metadata.APPLICATION_SHORT_NAME,
    APPLICATION_DESCRIPTION: metadata.APPLICATION_DESCRIPTION,
    ORGANIZATION_URL: emails.ORGANIZATION_LINK,
    ORGANIZATION_NAME: metadata.ORGANIZATION_NAME,
}

const links = {
    CIRCLE_APP_URL: "https://www.circleapp.com.br",
    PRIVACY_POLICY_URL: "https://www.circleapp.com.br/privacy-policy",
    TERMS_OF_SERVICE_URL: "https://www.circleapp.com.br/terms-of-service",
    COMMUNITY_GUIDELINES_URL: "https://www.circleapp.com.br/community-guidelines",
    CONTACT_US_URL: "https://www.circleapp.com.br/contact-us",
    HELP_URL: "https://www.circleapp.com.br/help",
    REPORT_ACCOUNT_URL: "https://www.circleapp.com.br/help/report-account",
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
    ...options,
    ...links,
}
