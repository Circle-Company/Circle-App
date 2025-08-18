import ReactNativeHapticFeedback from "react-native-haptic-feedback"
import { storage, storageKeys } from "../../store"

export type HapticFeedbackTypes =
    | "selection"
    | "impactLight"
    | "impactMedium"
    | "impactHeavy"
    | "rigid"
    | "soft"
    | "notificationSuccess"
    | "notificationWarning"
    | "notificationError"
    | "clockTick"
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
    if (storage.getBoolean(storageKeys().preferences.haptics) == false)
        ReactNativeHapticFeedback.trigger(hapticType, options)
}
