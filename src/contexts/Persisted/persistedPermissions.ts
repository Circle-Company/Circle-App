import create from "zustand"
import { storage } from "../../store"
import { storageKeys } from "./storageKeys"
import { PermissionsData } from "./types"

const storageKey = storageKeys().permissions

export interface PermissionsState extends PermissionsData {
    setPostNotifications: (value: boolean) => void
    setFirebaseMessaging: (value: boolean) => void
    set: (value: PermissionsData) => void
    load: () => void
    remove: () => void
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
    postNotifications: storage.getBoolean(storageKey.postNotifications) || false,
    firebaseMessaging: storage.getBoolean(storageKey.firebaseMessaging) || false,

    setPostNotifications: (value: boolean) => {
        storage.set(storageKey.postNotifications, value)
        set({ postNotifications: value })
    },
    setFirebaseMessaging: (value: boolean) => {
        storage.set(storageKey.firebaseMessaging, value)
        set({ postNotifications: value })
    },
    set: (value: PermissionsData) => {
        set({
            postNotifications: value.postNotifications,
            firebaseMessaging: value.firebaseMessaging,
        })
        storage.set(storageKey.postNotifications, value.postNotifications)
        storage.set(storageKey.firebaseMessaging, value.firebaseMessaging)
    },
    load: () => {
        set({
            postNotifications: storage.getBoolean(storageKey.postNotifications) || false,
            firebaseMessaging: storage.getBoolean(storageKey.firebaseMessaging) || false,
        })
    },
    remove: () => {
        storage.delete(storageKey.postNotifications)
        storage.delete(storageKey.firebaseMessaging)
        set({
            postNotifications: false,
            firebaseMessaging: false,
        })
    },
}))
