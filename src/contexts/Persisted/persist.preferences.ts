import { create } from "zustand"
import { storage, storageKeys, safeDelete, safeSet } from "@/store"
import { PreferencesContent, PreferencesDataType, PreferencesLanguage } from "./types"

const key = storageKeys().preferences

export interface PreferencesState {
    appTimezone: number
    timezoneCode: string
    language: PreferencesLanguage
    content: PreferencesContent
    setAppLanguage: (value: string) => void
    setPrimaryLanguage: (value: string) => void
    setDisableAutoPlay: (value: boolean) => void
    setDisableHaptics: (value: boolean) => void
    setDisableTranslation: (value: boolean) => void
    setTranslationLanguage: (value: string) => void
    setMuteAudio: (value: boolean) => void
    set: (value: PreferencesDataType) => void
    load: () => void
    remove: () => void
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
    appTimezone: storage.getNumber(key.appTimezone || "") || 0,
    timezoneCode: storage.getString(key.timezoneCode || "") || "",
    language: {
        appLanguage: storage.getString(key.appLanguage) || "en",
        translationLanguage: storage.getString(key.translationLanguage) || "en",
    },
    content: {
        disableAutoplay: storage.getBoolean(key.autoplay) || false,
        disableHaptics: storage.getBoolean(key.haptics) || false,
        disableTranslation: storage.getBoolean(key.translation) || false,
        muteAudio: storage.getBoolean(key.muteAudio) || false,
    },
    setAppLanguage: (value: string) => {
        safeSet(key.appLanguage, value)
        set((state) => ({
            language: {
                ...state.language,
                appLanguage: value,
            },
        }))
    },
    setPrimaryLanguage: (value: string) => {
        safeSet(key.primaryLanguage, value)
        set((state) => ({
            language: {
                ...state.language,
                primaryLanguage: value,
            },
        }))
    },
    setDisableAutoPlay: (value: boolean) => {
        safeSet(key.autoplay, value)
        set((state) => ({
            content: {
                ...state.content,
                disableAutoplay: value,
            },
        }))
    },
    setDisableHaptics: (value: boolean) => {
        safeSet(key.haptics, value)
        set((state) => ({
            content: {
                ...state.content,
                disableHaptics: value,
            },
        }))
    },
    setDisableTranslation: (value: boolean) => {
        safeSet(key.translation, value)
        set((state) => ({
            content: {
                ...state.content,
                disableTranslation: value,
            },
        }))
    },
    setMuteAudio: (value: boolean) => {
        safeSet(key.muteAudio, value)
        set((state) => ({
            content: {
                ...state.content,
                muteAudio: value,
            },
        }))
    },
    setTranslationLanguage: (value: string) => {
        safeSet(key.translationLanguage, value)
        set((state) => ({
            content: {
                ...state.content,
                translationLanguage: value,
            },
        }))
    },

    set: (value: PreferencesDataType) => {
        set({
            appTimezone: value.appTimezone,
            timezoneCode: value.timezoneCode,
            language: value.language,
            content: value.content,
        })

        safeSet(key.appLanguage, value.language.appLanguage)
        safeSet(key.translationLanguage, value.language.translationLanguage)
        safeSet(key.autoplay, value.content.disableAutoplay)
        safeSet(key.haptics, value.content.disableHaptics)
        safeSet(key.translation, value.content.disableTranslation)
        safeSet(key.muteAudio, value.content.muteAudio)
        safeSet(key.appTimezone, value.appTimezone)
        safeSet(key.timezoneCode, value.timezoneCode)
    },
    load: () => {
        set({
            appTimezone: storage.getNumber(key.appTimezone || "") || 0,
            timezoneCode: storage.getString(key.timezoneCode || "") || "",
            language: {
                appLanguage: storage.getString(key.appLanguage) || "en",
                translationLanguage: storage.getString(key.translationLanguage) || "en",
            },
            content: {
                disableAutoplay: storage.getBoolean(key.autoplay) || false,
                disableHaptics: storage.getBoolean(key.haptics) || false,
                disableTranslation: storage.getBoolean(key.translation) || false,
                muteAudio: storage.getBoolean(key.muteAudio) || false,
            },
        })
    },
    remove: () => {
        safeDelete(key.appLanguage)
        safeDelete(key.primaryLanguage)
        safeDelete(key.autoplay)
        safeDelete(key.haptics)
        safeDelete(key.translation)
        safeDelete(key.translationLanguage)
        safeDelete(key.muteAudio)
        safeDelete(key.appTimezone)
        safeDelete(key.timezoneCode)

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
        })
    },
}))
