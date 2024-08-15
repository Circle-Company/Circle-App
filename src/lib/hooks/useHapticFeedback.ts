import ReactNativeHapticFeedback from "react-native-haptic-feedback"

const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
}

export function Vibrate() {
    ReactNativeHapticFeedback.trigger("impactMedium", options)
}
