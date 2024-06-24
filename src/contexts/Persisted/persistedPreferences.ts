import create from 'zustand';
import { PreferencesDataStorageType } from './types'
import { storage } from '../../store';
import { storageKeys } from './storageKeys';

const storageKey = storageKeys().preferences

export interface PreferencesState extends PreferencesDataStorageType {
    setAppLanguage: (value: string) => void;
    setPrimaryLanguage: (value: string) => void;
    setDisableAutoPlay: (value: boolean) => void;
    setDisableHaptics: (value: boolean) => void;
    setDisableTranslation: (value: boolean) => void;
    setTranslationLanguage: (value: string) => void;
    set: (value: PreferencesDataStorageType) => void;
    load: () => void;
    remove: () => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
    language: {
        appLanguage: storage.getString(storageKey.appLanguage) || 'en',
        primaryLanguage: storage.getString(storageKey.primaryLanguage) || 'en',
    },
    content: {
        disableAutoplay: storage.getBoolean(storageKey.autoplay) || false,
        disableHaptics: storage.getBoolean(storageKey.haptics) || false,
        disableTranslation: storage.getBoolean(storageKey.translation) || false,
        translationLanguage: storage.getString(storageKey.translationLanguage) || 'en',
    },
    setAppLanguage: (value: string) => {
        storage.set(storageKey.appLanguage, value);
        set((state) => ({
            language: {
                ...state.language,
                appLanguage: value,
            },
        }));
    },
    setPrimaryLanguage: (value: string) => {
        storage.set(storageKey.primaryLanguage, value);
        set((state) => ({
            language: {
                ...state.language,
                primaryLanguage: value,
            },
        }));
    },
    setDisableAutoPlay: (value: boolean) => {
        storage.set(storageKey.autoplay, value);
        set((state) => ({
            content: {
                ...state.content,
                disableAutoplay: value,
            },
        }));
    },
    setDisableHaptics: (value: boolean) => {
        storage.set(storageKey.haptics, value);
        set((state) => ({
            content: {
                ...state.content,
                disableHaptics: value,
            },
        }));
    },
    setDisableTranslation: (value: boolean) => {
        storage.set(storageKey.translation, value);
        set((state) => ({
            content: {
                ...state.content,
                disableTranslation: value,
            },
        }));
    },
    setTranslationLanguage: (value: string) => {
        storage.set(storageKey.translationLanguage, value);
        set((state) => ({
            content: {
                ...state.content,
                translationLanguage: value,
            },
        }));
    },
    set: (value: PreferencesDataStorageType) => {
        set({
            language: value.language,
            content: value.content
        });
        storage.set(storageKey.appLanguage, value.language.appLanguage)
        storage.set(storageKey.primaryLanguage, value.language.primaryLanguage)
        storage.set(storageKey.haptics, value.content.disableHaptics)
        storage.set(storageKey.autoplay, value.content.disableAutoplay)
        storage.set(storageKey.translation, value.content.disableTranslation)
        storage.set(storageKey.translationLanguage, value.content.translationLanguage)

    },
    load: () => {
        set({
            language: {
                appLanguage: storage.getString(storageKey.appLanguage) || 'en',
                primaryLanguage: storage.getString(storageKey.primaryLanguage) || 'en',
            },
            content: {
                disableAutoplay: storage.getBoolean(storageKey.autoplay) || false,
                disableHaptics: storage.getBoolean(storageKey.haptics) || false,
                disableTranslation: storage.getBoolean(storageKey.translation) || false,
                translationLanguage: storage.getString(storageKey.translationLanguage) || 'en',
            },
        });
    },
    remove: () => {
        storage.delete(storageKey.appLanguage);
        storage.delete(storageKey.primaryLanguage);
        storage.delete(storageKey.autoplay);
        storage.delete(storageKey.haptics);
        storage.delete(storageKey.translation);
        storage.delete(storageKey.translationLanguage);

        set({
            language: {
                appLanguage: 'en',
                primaryLanguage: 'en',
            },
            content: {
                disableAutoplay: false,
                disableHaptics: false,
                disableTranslation: false,
                translationLanguage: 'en',
            },
        });
    },
}));