declare module "*.svg" {
    import React from "react"
    import { SvgProps } from "react-native-svg"
    const content: React.FC<SvgProps>
    export default content
}

declare module "@env" {
    export const API_VERSION: string
    export const APP_VERSION: string
    export const DEBUG: string
    export const LOG_DEBUG: string
    export const LOG_LEVEL: string
    export const MIXPANEL_KEY: string
    export const NODE_ENV: "development" | "production" | "test"
}

declare module "react-native-haptic-feedback" {
    export interface HapticOptions {
        enableVibrateFallback?: boolean
        ignoreAndroidSystemSettings?: boolean
    }

    export type HapticFeedbackTypes =
        | "impactLight"
        | "impactMedium"
        | "impactHeavy"
        | "rigid"
        | "soft"
        | "notificationSuccess"
        | "notificationWarning"
        | "notificationError"
        | "selection"
        | "clockTick"
        | "clockCLick"
        | "contextClick"
        | "keyboardPress"
        | "keyboardRelease"
        | "keyboardTap"
        | "longPress"
        | "textHandleMove"
        | "virtualKey"
        | "virtualKeyRelease"
        | "effectClick"
        | "effectDoubleClick"
        | "effectHeavyClick"
        | "effectTick"

    export default class ReactNativeHapticFeedback {
        static trigger(type: HapticFeedbackTypes, options?: HapticOptions): void
    }
}
