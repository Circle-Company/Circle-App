import { Mixpanel } from "mixpanel-react-native"
import config from "@/config"

const trackAutomaticEvents = false
const useNative = false

let mixpanelInstance: Mixpanel | null = null
let initialized = false

function isValidKey(key: any): key is string {
    return typeof key === "string" && key.trim().length > 0 && key !== "undefined" && key !== "null"
}

function getMixpanel(): Mixpanel | null {
    try {
        if (initialized) return mixpanelInstance
        const key = (config as any)?.MIXPANEL_KEY
        if (!isValidKey(key)) {
            console.warn("Mixpanel: invalid or missing MIXPANEL_KEY; tracking disabled")
            initialized = true
            return null
        }
        try {
            const masked = typeof key === "string" ? key.slice(0, 4) + "****" : ""
            console.log("Mixpanel: initializing", masked)
        } catch {}
        mixpanelInstance = new Mixpanel(key as string, trackAutomaticEvents, useNative)
        mixpanelInstance.init()
        console.log("Mixpanel: initialized")
        initialized = true
        return mixpanelInstance
    } catch {
        initialized = true
        mixpanelInstance = null
        return null
    }
}

function identifyUser(mp: Mixpanel, username: string) {
    try {
        const id = (username || "").trim()
        if (!id) return
        mp.identify(id)
        try {
            mp.getPeople().set({ username: id, $name: id })
        } catch {}
    } catch {}
}

export function trackAppOpen(username: string = ""): void {
    const mp = getMixpanel()
    if (!mp) {
        console.warn("Mixpanel: not initialized; skipping app_open", { username })
        return
    }
    try {
        console.log("Mixpanel track: app_open", { username })
        identifyUser(mp, username)
        mp.track("app_open", { username })
    } catch {
        // no-op
    }
}

export function trackLogin(username: string = ""): void {
    const mp = getMixpanel()
    if (!mp) {
        console.warn("Mixpanel: not initialized; skipping login", { username })
        return
    }
    try {
        console.log("Mixpanel track: login", { username })
        identifyUser(mp, username)
        mp.track("login", { username })
    } catch {
        // no-op
    }
}

export function trackLogout(username: string = ""): void {
    const mp = getMixpanel()
    if (!mp) {
        console.warn("Mixpanel: not initialized; skipping logout", { username })
        return
    }
    try {
        console.log("Mixpanel track: logout", { username })
        mp.track("logout", { username })
        mp.reset()
        console.log("Mixpanel: reset after logout")
    } catch {
        // no-op
    }
}

export function trackAppClose(username: string = ""): void {
    const mp = getMixpanel()
    if (!mp) {
        console.warn("Mixpanel: not initialized; skipping app_close", { username })
        return
    }
    try {
        console.log("Mixpanel track: app_close", { username })
        mp.track("app_close", { username })
    } catch {
        // no-op
    }
}
