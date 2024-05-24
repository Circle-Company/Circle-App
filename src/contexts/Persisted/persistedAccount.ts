import create from 'zustand';
import { AccountDataType } from './types';
import { storage } from '../../store'
import { storageKeys } from './storageKeys'
const storageKey = storageKeys().account

export interface AccountState extends AccountDataType {
    setBlocked: (value: boolean) => void;
    setMuted: (value: boolean) => void;
    setLastActiveAt: (value: string) => void;
    setLastLoginAt: (value: string) => void;
    setAccount: (value: AccountDataType) => void
    loadAccountFromStorage: () => void;
    removeAccountFromStorage: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
    blocked: storage.getBoolean(storageKey.blocked) || false,
    muted: storage.getBoolean(storageKey.muted) || false,
    last_active_at: storage.getString(storageKey.last_active_at) || new Date().toString(),
    last_login_at: storage.getString(storageKey.last_login_at) || new Date().toString(),

    setBlocked: (value: boolean) => {
        storage.set(storageKey.blocked, value);
        set({ blocked: value });
    },
    setMuted: (value: boolean) => {
        storage.set(storageKey.muted, value);
        set({ muted: value });
    },
    setLastActiveAt: (value: string) => {
        storage.set(storageKey.last_active_at, value);
        set({ last_active_at: value });
    },
    setLastLoginAt: (value: string) => {
        storage.set(storageKey.last_login_at, value);
        set({ last_login_at: value });
    },
    setAccount: (value: AccountDataType) => {
        set({
            blocked: value.blocked,
            muted: value.muted,
            last_active_at: value.last_active_at,
            last_login_at: value.last_login_at
        })
        storage.set(storageKey.blocked, value.blocked)
        storage.set(storageKey.muted, value.blocked)
        storage.set(storageKey.last_active_at, value.last_active_at)
        storage.set(storageKey.last_login_at, value.last_login_at)
    },
    loadAccountFromStorage: () => {
        set({
            blocked: storage.getBoolean(storageKey.blocked) || false,
            muted: storage.getBoolean(storageKey.muted) || false,
            last_active_at: storage.getString(storageKey.last_active_at) || new Date().toString(),
            last_login_at: storage.getString(storageKey.last_login_at) || new Date().toString(),
        });
    },
    removeAccountFromStorage: () => {
        storage.delete(storageKey.blocked);
        storage.delete(storageKey.muted);
        storage.delete(storageKey.last_active_at);
        storage.delete(storageKey.last_login_at);

        set({
            blocked: false,
            muted: false,
            last_active_at: new Date().toString(),
            last_login_at: new Date().toString(),
        });
    },
}));