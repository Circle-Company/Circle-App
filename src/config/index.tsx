import dotenv from 'dotenv'
import emails from './emails'
import metadata from './metadata'

// Load env file
if (require.resolve) {
    try {
        dotenv.config({ path: require.resolve('../../.env') })
    } catch (error: any) {
        // This error is thrown when the .env is not found
        if (error.code !== 'MODULE_NOT_FOUND') {
            throw error
        }
    }
}

// Use Cypress env or process.env
declare let Cypress: any | undefined
const env = typeof Cypress !== 'undefined' ? Cypress.env() : process.env // eslint-disable-line no-undef


const environment = {
    APP_VERSION: env.APP_VERSION,
    NODE_ENV: env.NODE_ENV || process.env.NODE_ENV,
    DEBUG: env.NODE_ENV !== 'production' && env.DEBUG,
    TEST: env.NODE_ENV === 'test',
    PRODUCTION: env.NODE_ENV === 'production',
}

const log = {
    LOG_LEVEL: env.LOG_LEVEL,
    LOG_DEBUG: env.LOG_DEBUG
}

const required = {
}

const options = {
    EMAIL_DEFAULT_SENDER: env.EMAIL_DEFAULT_SENDER,
    SUPPORT_URL: emails.SUPPORT_LINK,
    APPLICATION_NAME: metadata.APPLICATION_NAME,
    ORGANIZATION_URL: emails.ORGANIZATION_LINK,
    PUBLIC_REGISTRATION: env.PUBLIC_REGISTRATION === 'true' || false,
    INVITE_REGISTRATION: env.INVITE_REGISTRATION !== 'false', // default = true
}

  // Check if all required configs are present
Object.entries(required).map((entry) => {
    if (!entry[1]) {
      throw new Error(`ERROR: "${entry[0]}" env variable is missing.`)
    }
    return entry
})

export default {
    ...environment,
    ...log,
    ...options,
  }