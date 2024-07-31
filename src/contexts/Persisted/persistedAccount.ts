import create from "zustand"
import { storage } from "../../store"
import { storageKeys } from "./storageKeys"
import { AccountDataType } from "./types"
const storageKey = storageKeys().account

export interface AccountState extends AccountDataType {
    setFirebasePushToken: (value: string) => void
    setBlocked: (value: boolean) => void
    setMuted: (value: boolean) => void
    setLastActiveAt: (value: string) => void
    setLastLoginAt: (value: string) => void
    set: (value: AccountDataType) => void
    load: () => void
    remove: () => void
}

export const useAccountStore = create<AccountState>((set) => ({
    firebasePushToken: storage.getString(storageKey.firebasePushToken) || "",
    blocked: storage.getBoolean(storageKey.blocked) || false,
    muted: storage.getBoolean(storageKey.muted) || false,
    last_active_at: storage.getString(storageKey.last_active_at) || new Date().toString(),
    last_login_at: storage.getString(storageKey.last_login_at) || new Date().toString(),

    setFirebasePushToken: (value: string) => {
        storage.set(storageKey.firebasePushToken, value.toString())
        set({ firebasePushToken: value })
    },

    setBlocked: (value: boolean) => {
        storage.set(storageKey.blocked, value)
        set({ blocked: value })
    },
    setMuted: (value: boolean) => {
        storage.set(storageKey.muted, value)
        set({ muted: value })
    },
    setLastActiveAt: (value: string) => {
        storage.set(storageKey.last_active_at, value)
        set({ last_active_at: value })
    },
    setLastLoginAt: (value: string) => {
        storage.set(storageKey.last_login_at, value)
        set({ last_login_at: value })
    },
    set: (value: AccountDataType) => {
        set({
            firebasePushToken: value.firebasePushToken,
            blocked: value.blocked,
            muted: value.muted,
            last_active_at: value.last_active_at,
            last_login_at: value.last_login_at,
        })
        storage.set(storageKey.firebasePushToken, value.firebasePushToken.toString())
        storage.set(storageKey.blocked, value.blocked)
        storage.set(storageKey.muted, value.blocked)
        storage.set(storageKey.last_active_at, value.last_active_at)
        storage.set(storageKey.last_login_at, value.last_login_at)
    },
    load: () => {
        set({
            firebasePushToken: storage.getString(storageKey.firebasePushToken) || "",
            blocked: storage.getBoolean(storageKey.blocked) || false,
            muted: storage.getBoolean(storageKey.muted) || false,
            last_active_at: storage.getString(storageKey.last_active_at) || new Date().toString(),
            last_login_at: storage.getString(storageKey.last_login_at) || new Date().toString(),
        })
    },
    remove: () => {
        storage.delete(storageKey.firebasePushToken)
        storage.delete(storageKey.blocked)
        storage.delete(storageKey.muted)
        storage.delete(storageKey.last_active_at)
        storage.delete(storageKey.last_login_at)

        set({
            firebasePushToken: "",
            blocked: false,
            muted: false,
            last_active_at: new Date().toString(),
            last_login_at: new Date().toString(),
        })
    },
}))
