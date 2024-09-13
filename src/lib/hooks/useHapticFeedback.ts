import PersistedContext from "@/contexts/Persisted"
import React from "react"
import ReactNativeHapticFeedback from "react-native-haptic-feedback"
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

const options = {
    enableVibrateFallback: false,
    ignoreAndroidSystemSettings: true,
}

export function Vibrate(hapticType: HapticFeedbackTypes) {
    const { session } = React.useContext(PersistedContext)
    if (session.preferences.content.disableHaptics == false)
        ReactNativeHapticFeedback.trigger(hapticType, options)
}
