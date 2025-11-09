import {
    PreferencesContent,
    PreferencesDataType,
    PreferencesLanguage,
    PreferencesPushNotifications,
} from "./types"
import { storage, storageKeys } from "../../store"

import { create } from "zustand"

const storageKey = storageKeys().preferences

export interface PreferencesState {
    appTimezone: number
    timezoneCode: string
    language: PreferencesLanguage
    content: PreferencesContent
    pushNotifications: PreferencesPushNotifications
    setAppLanguage: (value: string) => void
    setPrimaryLanguage: (value: string) => void
    setDisableAutoPlay: (value: boolean) => void
    setDisableHaptics: (value: boolean) => void
    setDisableTranslation: (value: boolean) => void
    setTranslationLanguage: (value: string) => void
    setMuteAudio: (value: boolean) => void
    setDisableLikeMoment: (value: boolean) => void
    setDisableNewMemory: (value: boolean) => void
    setDisableAddToMemory: (value: boolean) => void
    setDisableFollowUser: (value: boolean) => void
    setDisableViewUser: (value: boolean) => void
    set: (value: PreferencesDataType) => void
    load: () => void
    remove: () => void
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
    appTimezone: storage.getNumber(storageKey.appTimezone || "") || 0,
    timezoneCode: storage.getString(storageKey.timezoneCode || "") || "",
    language: {
        appLanguage: storage.getString(storageKey.appLanguage) || "en",
        translationLanguage: storage.getString(storageKey.translationLanguage) || "en",
    },
    content: {
        disableAutoplay: storage.getBoolean(storageKey.autoplay) || false,
        disableHaptics: storage.getBoolean(storageKey.haptics) || false,
        disableTranslation: storage.getBoolean(storageKey.translation) || false,
        muteAudio: storage.getBoolean(storageKey.muteAudio) || false,
    },
    pushNotifications: {
        disableLikeMoment: storage.getBoolean(storageKey.likeMoment) || false,
        disableNewMemory: storage.getBoolean(storageKey.newMemory) || false,
        disableAddToMemory: storage.getBoolean(storageKey.addToMemory) || false,
        disableFollowUser: storage.getBoolean(storageKey.followUser) || false,
        disableViewUser: storage.getBoolean(storageKey.viewUser) || false,
    },
    setAppLanguage: (value: string) => {
        storage.set(storageKey.appLanguage, value)
        set((state) => ({
            language: {
                ...state.language,
                appLanguage: value,
            },
        }))
    },
    setPrimaryLanguage: (value: string) => {
        storage.set(storageKey.primaryLanguage, value)
        set((state) => ({
            language: {
                ...state.language,
                primaryLanguage: value,
            },
        }))
    },
    setDisableAutoPlay: (value: boolean) => {
        storage.set(storageKey.autoplay, value)
        set((state) => ({
            content: {
                ...state.content,
                disableAutoplay: value,
            },
        }))
    },
    setDisableHaptics: (value: boolean) => {
        storage.set(storageKey.haptics, value)
        set((state) => ({
            content: {
                ...state.content,
                disableHaptics: value,
            },
        }))
    },
    setDisableTranslation: (value: boolean) => {
        storage.set(storageKey.translation, value)
        set((state) => ({
            content: {
                ...state.content,
                disableTranslation: value,
            },
        }))
    },
    setMuteAudio: (value: boolean) => {
        storage.set(storageKey.muteAudio, value)
        set((state) => ({
            content: {
                ...state.content,
                muteAudio: value,
            },
        }))
    },
    setTranslationLanguage: (value: string) => {
        storage.set(storageKey.translationLanguage, value)
        set((state) => ({
            content: {
                ...state.content,
                translationLanguage: value,
            },
        }))
    },

    setDisableLikeMoment: (value: boolean) => {
        storage.set(storageKey.likeMoment, value)
        set((state) => ({
            pushNotifications: {
                ...state.pushNotifications,
                disableLikeMoment: value,
            },
        }))
    },

    setDisableNewMemory: (value: boolean) => {
        storage.set(storageKey.newMemory, value)
        set((state) => ({
            pushNotifications: {
                ...state.pushNotifications,
                disableNewMemory: value,
            },
        }))
    },

    setDisableAddToMemory: (value: boolean) => {
        storage.set(storageKey.addToMemory, value)
        set((state) => ({
            pushNotifications: {
                ...state.pushNotifications,
                disableAddToMemory: value,
            },
        }))
    },

    setDisableFollowUser: (value: boolean) => {
        storage.set(storageKey.followUser, value)
        set((state) => ({
            pushNotifications: {
                ...state.pushNotifications,
                disableFollowUser: value,
            },
        }))
    },

    setDisableViewUser: (value: boolean) => {
        storage.set(storageKey.viewUser, value)
        set((state) => ({
            pushNotifications: {
                ...state.pushNotifications,
                disableViewUser: value,
            },
        }))
    },
    set: (value: PreferencesDataType) => {
        set({
            appTimezone: value.appTimezone,
            timezoneCode: value.timezoneCode,
            language: value.language,
            content: value.content,
            pushNotifications: value.pushNotifications,
        })

        storage.set(storageKey.appLanguage, value.language.appLanguage)
        storage.set(storageKey.translationLanguage, value.language.translationLanguage)
        storage.set(storageKey.autoplay, value.content.disableAutoplay)
        storage.set(storageKey.haptics, value.content.disableHaptics)
        storage.set(storageKey.translation, value.content.disableTranslation)
        storage.set(storageKey.muteAudio, value.content.muteAudio)
        storage.set(storageKey.likeMoment, value.pushNotifications.disableLikeMoment)
        storage.set(storageKey.newMemory, value.pushNotifications.disableNewMemory)
        storage.set(storageKey.addToMemory, value.pushNotifications.disableAddToMemory)
        storage.set(storageKey.followUser, value.pushNotifications.disableFollowUser)
        storage.set(storageKey.viewUser, value.pushNotifications.disableViewUser)
        storage.set(storageKey.appTimezone || "@circle:preferences:timezone", value.appTimezone)
        storage.set(
            storageKey.timezoneCode || "@circle:preferences:timezoneCode",
            value.timezoneCode,
        )
    },
    load: () => {
        set({
            appTimezone: storage.getNumber(storageKey.appTimezone || "") || 0,
            timezoneCode: storage.getString(storageKey.timezoneCode || "") || "",
            language: {
                appLanguage: storage.getString(storageKey.appLanguage) || "en",
                translationLanguage: storage.getString(storageKey.translationLanguage) || "en",
            },
            content: {
                disableAutoplay: storage.getBoolean(storageKey.autoplay) || false,
                disableHaptics: storage.getBoolean(storageKey.haptics) || false,
                disableTranslation: storage.getBoolean(storageKey.translation) || false,
                muteAudio: storage.getBoolean(storageKey.muteAudio) || false,
            },
            pushNotifications: {
                disableLikeMoment: storage.getBoolean(storageKey.likeMoment) || false,
                disableNewMemory: storage.getBoolean(storageKey.newMemory) || false,
                disableAddToMemory: storage.getBoolean(storageKey.addToMemory) || false,
                disableFollowUser: storage.getBoolean(storageKey.followUser) || false,
                disableViewUser: storage.getBoolean(storageKey.viewUser) || false,
            },
        })
    },
    remove: () => {
        storage.delete(storageKey.appLanguage)
        storage.delete(storageKey.primaryLanguage)
        storage.delete(storageKey.autoplay)
        storage.delete(storageKey.haptics)
        storage.delete(storageKey.translation)
        storage.delete(storageKey.translationLanguage)
        storage.delete(storageKey.muteAudio)
        storage.delete(storageKey.likeMoment)
        storage.delete(storageKey.newMemory)
        storage.delete(storageKey.addToMemory)
        storage.delete(storageKey.followUser)
        storage.delete(storageKey.viewUser)
        storage.delete(storageKey.appTimezone || "@circle:preferences:timezone")
        storage.delete(storageKey.timezoneCode || "@circle:preferences:timezoneCode")

        set({
            appTimezone: 0,
            timezoneCode: "",
            language: {
                appLanguage: "en",
                translationLanguage: "en",
            },
            content: {
                disableAutoplay: false,
                disableHaptics: false,
                disableTranslation: false,
                muteAudio: false,
            },
            pushNotifications: {
                disableLikeMoment: false,
                disableAddToMemory: false,
                disableNewMemory: false,
                disableFollowUser: false,
                disableViewUser: false,
            },
        })
    },
}))
