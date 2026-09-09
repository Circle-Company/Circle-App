import type { TimezoneCode } from "circle-text-library"

import type { PreferencesContent, PreferencesDataType, PreferencesLanguage } from "../types"

/** O que vai para `@circle:preferences`. */
export type PersistedPreferences = PreferencesDataType & {
    schemaVersion: number
    /** Fica no blob junto do resto: é preferência de aparelho, e o onboarding de permissões
     * não deve reaparecer só porque o usuário trocou de conta. */
    onboardingPermissionsCompleted: boolean
}

export interface PreferencesState {
    appTimezone: number
    timezoneCode: string
    language: PreferencesLanguage
    content: PreferencesContent
    onboardingPermissionsCompleted: boolean

    setAppLanguage: (value: string) => void
    setTranslationLanguage: (value: string) => void
    setTimezoneCode: (value: TimezoneCode) => void
    setAppTimezone: (value: number) => void

    setDisableAutoPlay: (value: boolean) => void
    setDisableHaptics: (value: boolean) => void
    setDisableTranslation: (value: boolean) => void
    setDisableContentWarning: (value: boolean) => void
    setMuteAudio: (value: boolean) => void

    setOnboardingPermissionsCompleted: (value: boolean) => void

    set: (value: PreferencesDataType) => void
    /** Lê do storage. Explícito: o store não faz I/O no import. */
    hydrate: () => void
    /** Volta aos padrões, em memória **e** no storage. */
    clear: () => void
}
