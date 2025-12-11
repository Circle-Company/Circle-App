import { storage, storageKeys } from "../../store"

import { AccountDataType } from "./types"
import { create } from "zustand"

const keys = storageKeys()
const accountKey = keys.account
const statusKeyPrefix = `${keys.baseKey}account:status:`

export interface AccountState extends AccountDataType {
    coordinates: {
        latitude: number
        longitude: number
    }
    set: (value: AccountDataType) => void
    setCoordinates: (value: { latitude: number; longitude: number }) => void
    load: () => void
    remove: () => void
}

const readStatus = () => ({
    accessLevel: storage.getString(`${statusKeyPrefix}accesslevel`) || "",
    verified: storage.getBoolean(`${statusKeyPrefix}verified`) || false,
    deleted: storage.getBoolean(`${statusKeyPrefix}deleted`) || false,
    createdAt: storage.getString(`${statusKeyPrefix}createdat`) || "",
    updatedAt: storage.getString(`${statusKeyPrefix}updatedat`) || "",
})

const readFromStorage = (): AccountDataType & {
    coordinates: { latitude: number; longitude: number }
} => ({
    jwtToken: storage.getString(accountKey.jwt.token) || "",
    jwtExpiration: storage.getString(accountKey.jwt.expiration) || "",
    refreshToken: storage.getString(accountKey.jwt.refreshToken) || undefined,
    blocked: storage.getBoolean(accountKey.blocked) || false,
    muted: storage.getBoolean(accountKey.muted) || false,
    ...readStatus(),
    last_active_at: storage.getString(accountKey.last_active_at) || "",
    last_login_at: storage.getString(accountKey.last_login_at) || "",
    coordinates: {
        latitude: storage.getNumber(accountKey.coordinates.latitude) || 0,
        longitude: storage.getNumber(accountKey.coordinates.longitude) || 0,
    },
})

export const useAccountStore = create<AccountState>((set) => ({
    ...readFromStorage(),
    set: (value: AccountDataType) => {
        storage.set(accountKey.jwt.token, value.jwtToken)
        storage.set(accountKey.jwt.expiration, value.jwtExpiration)

        if (value.refreshToken) {
            storage.set(accountKey.jwt.refreshToken, value.refreshToken)
        } else {
            storage.delete(accountKey.jwt.refreshToken)
        }

        storage.set(accountKey.blocked, value.blocked)
        storage.set(accountKey.muted, value.muted)
        storage.set(accountKey.last_active_at, value.last_active_at)
        storage.set(accountKey.last_login_at, value.last_login_at)
        storage.set(`${statusKeyPrefix}accesslevel`, value.accessLevel || "")
        storage.set(`${statusKeyPrefix}verified`, value.verified || false)
        storage.set(`${statusKeyPrefix}deleted`, value.deleted || false)
        storage.set(`${statusKeyPrefix}createdat`, value.createdAt || "")
        storage.set(`${statusKeyPrefix}updatedat`, value.updatedAt || "")

        set((state) => ({
            ...state,
            ...value,
            last_active_at: value.last_active_at,
            last_login_at: value.last_login_at,
        }))
    },
    setCoordinates: (value: { latitude: number; longitude: number }) => {
        storage.set(accountKey.coordinates.latitude, value.latitude)
        storage.set(accountKey.coordinates.longitude, value.longitude)
        set((state) => ({
            ...state,
            coordinates: { ...value },
        }))
    },
    load: () => {
        set(readFromStorage())
    },
    remove: () => {
        console.log("🧹 [AccountStore] Removendo dados da conta...")
        storage.delete(accountKey.jwt.token)
        storage.delete(accountKey.jwt.expiration)
        storage.delete(accountKey.jwt.refreshToken)
        storage.delete(accountKey.blocked)
        storage.delete(accountKey.muted)
        storage.delete(accountKey.last_active_at)
        storage.delete(accountKey.last_login_at)
        storage.delete(accountKey.coordinates.latitude)
        storage.delete(accountKey.coordinates.longitude)
        storage.delete(`${statusKeyPrefix}accesslevel`)
        storage.delete(`${statusKeyPrefix}verified`)
        storage.delete(`${statusKeyPrefix}deleted`)
        storage.delete(`${statusKeyPrefix}createdat`)
        storage.delete(`${statusKeyPrefix}updatedat`)

        const emptyState = {
            jwtToken: "",
            jwtExpiration: "",
            refreshToken: undefined,
            blocked: false,
            muted: false,
            accessLevel: "",
            verified: false,
            deleted: false,
            createdAt: "",
            updatedAt: "",
            last_active_at: "",
            last_login_at: "",
            coordinates: { latitude: 0, longitude: 0 },
        }

        set(emptyState)
        console.log("✅ [AccountStore] Dados da conta removidos. Estado resetado.")
    },
}))
