/**
 * Stub do módulo virtual `@env`.
 *
 * Em runtime quem resolve `@env` é o `react-native-dotenv`, um plugin de Babel
 * que só roda no pipeline do Metro. O Vitest transforma com esbuild e não passa
 * por ele, então sem este stub qualquer import que chegue em `src/config`
 * quebra com "Failed to resolve import @env".
 *
 * Valores fixos de propósito: teste não deve depender do `.env` da máquina.
 */
export const ENDPOINT = "https://api.test.local"
export const API_VESION = "1.0.0"
export const APP_VERSION = "1.0.0-test"
export const MIXPANEL_KEY = "test-mixpanel-key"
export const NODE_ENV = "test"
export const DEBUG = false

export const CIRCLE_UPLOAD_KEY_ALIAS = "test-alias"
export const CIRCLE_UPLOAD_KEY_PASSWORD = "test-password"
export const CIRCLE_UPLOAD_STORE_FILE = "test-store-file"
export const CIRCLE_UPLOAD_STORE_PASSWORD = "test-store-password"
