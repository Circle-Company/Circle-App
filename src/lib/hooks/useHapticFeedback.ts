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
    ReactNativeHapticFeedback.trigger(hapticType, options)
}
