import { LanguagesCodesType } from "@/locales/LanguageTypes"

export type SetLanguageProps = {
    userId: string
    appLanguage: LanguagesCodesType
}

export type SetHapticsProps = {
    userId: string
    disableHaptics: boolean
}
