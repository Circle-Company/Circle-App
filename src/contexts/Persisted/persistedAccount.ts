import create from "zustand"
import { storage, storageKeys } from "../../store"
import { AccountDataType } from "./types"
const storageKey = storageKeys().account

export interface AccountState extends AccountDataType {
    setUnreadNotificationsCount: (value: number) => void
    setJwtToken: (value: string) => void
    setJwtExpiration: (value: string) => void
    setBlocked: (value: boolean) => void
    setMuted: (value: boolean) => void
    setLastActiveAt: (value: string) => void
    setLastLoginAt: (value: string) => void
    set: (value: AccountDataType) => void
    load: () => void
    remove: () => void
}

export const useAccountStore = create<AccountState>((set) => ({
    unreadNotificationsCount: storage.getNumber(storageKey.unreadNotificationsCount) || 0,
    jwtToken: storage.getString(storageKey.jwt.token) || "",
    jwtExpiration: storage.getString(storageKey.jwt.expiration) || "",
    blocked: storage.getBoolean(storageKey.blocked) || false,
    muted: storage.getBoolean(storageKey.muted) || false,
    last_active_at: storage.getString(storageKey.last_active_at) || new Date().toString(),
    last_login_at: storage.getString(storageKey.last_login_at) || new Date().toString(),

    setUnreadNotificationsCount: (value: number) => {
        if (typeof value === "number") {
            storage.set(storageKey.unreadNotificationsCount, value)
            set({ unreadNotificationsCount: value })
        }
    },

    setJwtToken: (value: string) => {
        if (typeof value === "string") {
            storage.set(storageKey.jwt.token, value)
            set({ jwtToken: value })
        }
    },

    setJwtExpiration: (value: string) => {
        if (typeof value === "string") {
            storage.set(storageKey.jwt.expiration, value)
            set({ jwtExpiration: value })
        }
    },

    setBlocked: (value: boolean) => {
        if (typeof value === "boolean") {
            storage.set(storageKey.blocked, value)
            set({ blocked: value })
        }
    },

    setMuted: (value: boolean) => {
        if (typeof value === "boolean") {
            storage.set(storageKey.muted, value)
            set({ muted: value })
        }
    },

    setLastActiveAt: (value: string) => {
        if (typeof value === "string") {
            storage.set(storageKey.last_active_at, value)
            set({ last_active_at: value })
        }
    },

    setLastLoginAt: (value: string) => {
        if (typeof value === "string") {
            storage.set(storageKey.last_login_at, value)
            set({ last_login_at: value })
        }
    },

    set: (value: AccountDataType) => {
        set({
            unreadNotificationsCount: value.unreadNotificationsCount || 0,
            blocked: value.blocked || false,
            muted: value.muted || false,
            last_active_at: value.last_active_at || new Date().toString(),
            last_login_at: value.last_login_at || new Date().toString(),
            jwtToken: value.jwtToken || "",
            jwtExpiration: value.jwtExpiration || "",
        })
        storage.set(storageKey.unreadNotificationsCount, value.unreadNotificationsCount || 0)
        storage.set(storageKey.blocked, value.blocked || false)
        storage.set(storageKey.muted, value.muted || false)
        storage.set(storageKey.jwt.token, value.jwtToken || "")
        storage.set(storageKey.jwt.expiration, value.jwtExpiration || "")
        storage.set(storageKey.last_active_at, value.last_active_at || new Date().toString())
        storage.set(storageKey.last_login_at, value.last_login_at || new Date().toString())
    },
    load: () => {
        set({
            unreadNotificationsCount: storage.getNumber(storageKey.unreadNotificationsCount) || 0,
            blocked: storage.getBoolean(storageKey.blocked) || false,
            muted: storage.getBoolean(storageKey.muted) || false,
            jwtToken: storage.getString(storageKey.jwt.token) || "",
            jwtExpiration: storage.getString(storageKey.jwt.expiration) || "",
            last_active_at: storage.getString(storageKey.last_active_at) || new Date().toString(),
            last_login_at: storage.getString(storageKey.last_login_at) || new Date().toString(),
        })
    },
    remove: () => {
        storage.delete(storageKey.unreadNotificationsCount)
        storage.delete(storageKey.blocked)
        storage.delete(storageKey.muted)
        storage.delete(storageKey.jwt.token)
        storage.delete(storageKey.jwt.expiration)
        storage.delete(storageKey.last_active_at)
        storage.delete(storageKey.last_login_at)

        set({
            unreadNotificationsCount: 0,
            blocked: false,
            muted: false,
            jwtToken: "",
            jwtExpiration: "",
            last_active_at: new Date().toString(),
            last_login_at: new Date().toString(),
        })
    },
}))
