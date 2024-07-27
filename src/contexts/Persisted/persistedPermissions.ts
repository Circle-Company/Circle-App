import create from "zustand"
import { storage } from "../../store"
import { storageKeys } from "./storageKeys"
import { PermissionsData } from "./types"

const storageKey = storageKeys().permissions

export interface PermissionsState extends PermissionsData {
    setPostNotifications: (value: boolean) => void
    set: (value: PermissionsData) => void
    load: () => void
    remove: () => void
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
    postNotifications: storage.getBoolean(storageKey.postNotifications) || false,

    setPostNotifications: (value: boolean) => {
        storage.set(storageKey.postNotifications, value)
        set({ postNotifications: value })
    },
    set: (value: PermissionsData) => {
        set({ postNotifications: value.postNotifications })
        storage.set(storageKey.postNotifications, value.postNotifications)
    },
    load: () => {
        set({
            postNotifications: storage.getBoolean(storageKey.postNotifications) || false,
        })
    },
    remove: () => {
        storage.delete(storageKey.postNotifications)
        set({
            postNotifications: false,
        })
    },
}))
