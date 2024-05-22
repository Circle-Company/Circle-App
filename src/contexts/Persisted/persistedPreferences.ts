import { PreferencesDataStorageType, ContentDataStorageType, LanguageDataStorageType} from "./types"
import { storage } from "../../store"
import { storageKeys } from "./storageKeys"

const storageKey = storageKeys().preferences

export class persistedPreferencesClass {
    public language : LanguageDataStorageType
    public content : ContentDataStorageType

    constructor({ language, content }: PreferencesDataStorageType) {
        this.language = language
        this.content = content
    }

    public setPrimaryLanguage(value: string) {
        this.language.primaryLanguage = value
        storage.set(storageKey.primaryLanguage, value)
    }
    public setAppLanguage(value: string) {
        this.language.appLanguage = value
        storage.set(storageKey.appLanguage, value)
    }
    public setDisableAutoPlay(value: boolean) {
        this.content.disableAutoplay = value
        storage.set(storageKey.autoplay, value)
    }
    public setDisableHaptics(value: boolean) {
        this.content.disableHaptics = value
        storage.set(storageKey.haptics, value)
    }
    public setDisableTranslation(value: boolean) {
        this.content.disableTranslation = value
        storage.set(storageKey.translation, value)
    }
    public setTranslationLanguage(value: string) {
        this.content.translationLanguage = value
        storage.set(storageKey.translationLanguage, value)
    }
    public setLanguage(value: LanguageDataStorageType) {
        this.setAppLanguage(value.appLanguage)
        this.setPrimaryLanguage(value.primaryLanguage)
    }

    public setContent(value: ContentDataStorageType) {
        this.setDisableAutoPlay(value.disableAutoplay)
        this.setDisableHaptics(value.disableHaptics)
        this.setDisableTranslation(value.disableTranslation)
        this.setTranslationLanguage(value.translationLanguage)
    }

    public storePreferences(value: PreferencesDataStorageType) {
        this.setLanguage(value.language)
        this.setContent(value.content)
    }

    public loadPreferencesFromStorage() {
        const appLanguage = storage.getString(storageKey.appLanguage)
        const primaryLanguage = storage.getString(storageKey.primaryLanguage)
        const disableAutoplay = storage.getBoolean(storageKey.autoplay)
        const disableHaptics = storage.getBoolean(storageKey.haptics)
        const disableTranslation = storage.getBoolean(storageKey.translation)
        const translationLanguage = storage.getString(storageKey.translationLanguage)
        if(appLanguage) this.setAppLanguage(appLanguage)
        if(primaryLanguage) this.setPrimaryLanguage(primaryLanguage)
        if(disableAutoplay) this.setDisableAutoPlay(disableAutoplay)
        if(disableHaptics) this.setDisableHaptics(disableHaptics)
        if(disableTranslation) this.setDisableTranslation(disableTranslation)
        if(translationLanguage) this.setTranslationLanguage(translationLanguage)
    }

    public removePreferencesFromStorage() {
        storage.delete(storageKey.appLanguage)
        storage.delete(storageKey.primaryLanguage)
        storage.delete(storageKey.autoplay)
        storage.delete(storageKey.haptics)
        storage.delete(storageKey.translation)
        storage.delete(storageKey.translationLanguage)
    }
}