import { AccountDataType } from "./types"
import { storage } from "../../store"
import { storageKeys } from "./storageKeys"

const storageKey = storageKeys().account

export class persistedAccountClass {
    public blocked: boolean
    public muted: boolean
    public last_active_at: string
    public last_login_at: string

    constructor({
        blocked,
        muted,
        last_active_at,
        last_login_at
    }: AccountDataType) {
        this.blocked = blocked
        this.muted = muted
        this.last_active_at = last_active_at
        this.last_login_at = last_login_at
    }

    public setBlocked(value: boolean) {
        this.blocked = value
        storage.set(storageKey.blocked, value)
    }
    public setMuted(value: boolean) {
        this.muted = value
        storage.set(storageKey.muted, value)
    }
    public setLastActiveAt(value: string) {
        this.last_active_at = value
        storage.set(storageKey.last_active_at, value)
    }
    public setLastLoginAt(value: string) {
        this.last_login_at = value
        storage.set(storageKey.last_login_at, value)
    }

    public storeAccount(value: AccountDataType) {
        this.setBlocked(value.blocked)
        this.setMuted(value.muted)
        this.setLastActiveAt(value.last_active_at)
        this.setLastLoginAt(value.last_login_at)
    }

    public loadAccountFromStorage() {
        const blocked = storage.getBoolean(storageKey.blocked)
        const muted = storage.getBoolean(storageKey.muted)
        const last_active_at = storage.getString(storageKey.last_active_at)
        const last_login_at = storage.getString(storageKey.last_login_at)

        if(blocked) this.blocked = blocked
        if(muted) this.muted = muted
        if(last_active_at) this.last_active_at = last_active_at
        if(last_login_at) this.last_login_at = last_login_at
    }

    public removeAccountFromStorage() {
        storage.delete(storageKey.blocked)
        storage.delete(storageKey.muted)
        storage.delete(storageKey.last_active_at)
        storage.delete(storageKey.last_login_at)
    }
}