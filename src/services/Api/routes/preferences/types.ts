import { LanguagesCodesType } from "locales/LanguageTypes"

export type GetUserPreferencesProps = {
    userId: number
}

export type SetAppLanguageProps = {
    userId: number
    appLanguage: LanguagesCodesType
}

export type SetHapticsProps = {
    userId: number
    disableHaptics: boolean
}

export type SetLikeMomentProps = {
    userId: number
    disableLikeMoment: boolean
}

export type SetNewMemoryProps = {
    userId: number
    disableNewMemory: boolean
}

export type SetAddToMemoryProps = {
    userId: number
    disableAddToMemory: boolean
}

export type SetFollowUserProps = {
    userId: number
    disableFollowUser: boolean
}

export type SetViewUserProps = {
    userId: number
    disableViewUser: boolean
}
