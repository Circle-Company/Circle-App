import { LanguagesCodesType } from "locales/LanguageTypes"

export type GetUserPreferencesProps = {
    userId: string
}

export type SetAppLanguageProps = {
    userId: string
    appLanguage: LanguagesCodesType
}

export type SetHapticsProps = {
    userId: string
    disableHaptics: boolean
}

export type SetLikeMomentProps = {
    userId: string
    disableLikeMoment: boolean
}

export type SetNewMemoryProps = {
    userId: string
    disableNewMemory: boolean
}

export type SetAddToMemoryProps = {
    userId: string
    disableAddToMemory: boolean
}

export type SetFollowUserProps = {
    userId: string
    disableFollowUser: boolean
}

export type SetViewUserProps = {
    userId: string
    disableViewUser: boolean
}
