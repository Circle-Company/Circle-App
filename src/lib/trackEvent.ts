import { Platform } from "react-native"
import { Mixpanel } from "mixpanel-react-native"
import config from "@/config"
import { storage, storageKeys } from "@/store"

const trackAutomaticEvents = false
const useNative = false

let mixpanelInstance: Mixpanel | null = null
let superPropertiesRegistered = false

/**
 * Identidade de quem dispara o evento. `id` é a chave primária do usuário no
 * backend e é o que vai para o `identify()` — nunca o username, que é texto
 * escolhido pela pessoa e não serve como `$user_id` estável.
 */
export type TrackedUser = {
    id?: string | null
    username?: string | null
}

// ──────────────────────────────────────────────────────────────────────────────
// Consentimento
//
// O app tem usuários em regiões que exigem consentimento (UE/Reino Unido/Suíça
// e Califórnia), então analytics é tratado como tracking não essencial: o SDK
// **não inicializa** enquanto não houver consentimento explícito. Sem decisão
// registrada, o padrão é não rastrear.
// ──────────────────────────────────────────────────────────────────────────────

/** `true` só com consentimento explícito. Ausência de decisão conta como não. */
export function hasAnalyticsConsent(): boolean {
    try {
        return storage.getBoolean(storageKeys().privacy.analyticsConsent) === true
    } catch {
        return false
    }
}

/** `false` enquanto o usuário nunca respondeu — use para decidir se pergunta. */
export function isAnalyticsConsentDecided(): boolean {
    try {
        return typeof storage.getBoolean(storageKeys().privacy.analyticsConsent) === "boolean"
    } catch {
        return false
    }
}

/**
 * Registra a decisão do usuário. Ao revogar, derruba a instância e chama
 * `reset()` para que nada mais saia e o device id seja descartado.
 */
export function setAnalyticsConsent(granted: boolean): void {
    try {
        const keys = storageKeys().privacy
        storage.set(keys.analyticsConsent, granted)
        storage.set(keys.analyticsConsentDecidedAt, new Date().toISOString())
    } catch {
        // noop
    }

    if (!granted) {
        try {
            mixpanelInstance?.reset()
            mixpanelInstance?.flush()
        } catch {
            // noop
        }
        mixpanelInstance = null
        superPropertiesRegistered = false
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// SDK
// ──────────────────────────────────────────────────────────────────────────────

function isValidKey(key: any): key is string {
    return typeof key === "string" && key.trim().length > 0 && key !== "undefined" && key !== "null"
}

function getMixpanel(): Mixpanel | null {
    // O gate vem antes de tudo e é reavaliado a cada chamada: o consentimento
    // pode ser concedido (ou revogado) a qualquer momento pelas configurações.
    if (!hasAnalyticsConsent()) return null
    if (mixpanelInstance) return mixpanelInstance

    try {
        const key = (config as any)?.MIXPANEL_KEY
        if (!isValidKey(key)) {
            console.warn("Mixpanel: invalid or missing MIXPANEL_KEY; tracking disabled")
            return null
        }
        const instance = new Mixpanel(key as string, trackAutomaticEvents, useNative)
        instance.init()
        mixpanelInstance = instance
        registerSuperProperties(instance)
        return instance
    } catch {
        mixpanelInstance = null
        return null
    }
}

/**
 * Propriedades anexadas a todo evento. Ficam aqui e não em cada `track()` para
 * não haver risco de uma chamada esquecer de mandá-las.
 */
function registerSuperProperties(mp: Mixpanel) {
    if (superPropertiesRegistered) return
    try {
        mp.registerSuperProperties({
            platform: Platform.OS,
            app_version: String((config as any)?.APP_VERSION ?? ""),
        })
        superPropertiesRegistered = true
    } catch {
        // noop
    }
}

/**
 * `identify()` com a chave primária do usuário. Sem `id` não identificamos:
 * criar perfil para anônimo polui a base e não dá para desfazer.
 */
function identifyUser(mp: Mixpanel, user: TrackedUser) {
    try {
        const id = String(user?.id || "").trim()
        if (!id) return
        mp.identify(id)
        const username = String(user?.username || "").trim()
        if (username) {
            try {
                mp.getPeople().set({ username })
            } catch {
                // noop
            }
        }
    } catch {
        // noop
    }
}

function track(event: string, user: TrackedUser, properties: Record<string, any> = {}) {
    const mp = getMixpanel()
    if (!mp) return
    try {
        identifyUser(mp, user)
        mp.track(event, properties)
    } catch {
        // noop
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Eventos
// ──────────────────────────────────────────────────────────────────────────────

export function trackAppOpen(user: TrackedUser = {}): void {
    track("app_open", user)
}

export function trackAppClose(user: TrackedUser = {}): void {
    track("app_close", user)
}

export function trackLogin(user: TrackedUser = {}): void {
    track("login", user)
}

/**
 * Value Moment: a curtida chegando de volta para quem publicou. É o sinal de
 * que o app entregou valor — o moment saiu e alguém reagiu.
 */
export function trackLikeNotificationReceived(
    user: TrackedUser = {},
    properties: { is_foreground?: boolean } = {},
): void {
    track("like_notification_received", user, properties)
}

/** Disparado só depois de o usuário existir no backend, nunca antes. */
export function trackSignUpCompleted(
    user: TrackedUser = {},
    properties: { sign_up_method?: string } = {},
): void {
    track("sign_up_completed", user, properties)
}

/**
 * `reset()` é obrigatório no logout: sem ele o próximo usuário do aparelho é
 * fundido na sessão do anterior.
 */
export function trackLogout(user: TrackedUser = {}): void {
    const mp = getMixpanel()
    if (!mp) return
    try {
        mp.track("logout")
        mp.reset()
        superPropertiesRegistered = false
        registerSuperProperties(mp)
    } catch {
        // noop
    }
}
